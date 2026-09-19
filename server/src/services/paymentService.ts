import crypto from "crypto";
import { Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import razorpay from "../config/razorpay";


export async function createOnlinePaymentOrder(
  orderId: string,
  userId: string,
) {

  const order =
    await prisma.order.findFirst({
      where:{
        id: orderId,
        userId,
      },
      include:{
        payment:true,
      },
    });


  if(!order){
    throw new Error(
      "Order not found"
    );
  }


  if(order.paymentMethod !== "ONLINE"){
    throw new Error(
      "Only online orders require payment"
    );
  }


  if(
    order.paymentStatus === "PAID"
  ){
    throw new Error(
      "Order already paid"
    );
  }


  const razorpayOrder =
    await razorpay.orders.create({

      amount:
        Number(order.total) * 100,

      currency:"INR",

      receipt:
        order.orderNumber,

      notes:{
        orderId:order.id,
      },

    });



  await prisma.payment.update({

    where:{
      orderId:order.id,
    },

    data:{
      provider:"RAZORPAY",

      gatewayOrderId:
        razorpayOrder.id,

      status:"PROCESSING",
    },

  });



  return {

    key:
      process.env.RAZORPAY_KEY_ID,

    gatewayOrderId:
      razorpayOrder.id,

    amount:
      razorpayOrder.amount,

    currency:
      razorpayOrder.currency,

    orderId:
      order.id,

  };

}




export async function verifyOnlinePayment(
  userId:string,
  data:{
    orderId:string;
    razorpayOrderId:string;
    razorpayPaymentId:string;
    razorpaySignature:string;
  }
){


 const order =
 await prisma.order.findFirst({

  where:{
    id:data.orderId,
    userId,
  },

  include:{
    payment:true,
  },

 });


 if(!order){
   throw new Error(
    "Order not found"
   );
 }



 const generatedSignature =
 crypto
 .createHmac(
   "sha256",
   process.env.RAZORPAY_KEY_SECRET!,
 )
 .update(
 `${data.razorpayOrderId}|${data.razorpayPaymentId}`
 )
 .digest("hex");



 if(
 generatedSignature !==
 data.razorpaySignature
 ){

 throw new Error(
  "Invalid payment signature"
 );

 }



 const updatedPayment =
 await prisma.$transaction(
 async(tx)=>{


 await tx.payment.update({

  where:{
    orderId:order.id,
  },

  data:{

    gatewayPaymentId:
      data.razorpayPaymentId,

    gatewaySignature:
      data.razorpaySignature,

    status:"PAID",

    paidAt:new Date(),

  },

 });



 return tx.order.update({

  where:{
    id:order.id,
  },

  data:{

    paymentStatus:
      "PAID",

    status:
      "PAYMENT_CONFIRMED",

  },

  include:{
    payment:true,
  },

 });

 });



 return updatedPayment;

}






export async function handlePaymentWebhook(
payload:any
){

 const event =
 payload.event;



 if(
 event ===
 "payment.captured"
 ){

 const payment =
 payload.payload.payment.entity;



 await prisma.payment.update({

  where:{
    gatewayPaymentId:
      payment.id,
  },

  data:{

    status:"PAID",

    paidAt:
      new Date(),

  },

 });


 }



 if(
 event ===
 "payment.failed"
 ){

 const payment =
 payload.payload.payment.entity;



 await prisma.payment.update({

  where:{
    gatewayPaymentId:
      payment.id,
  },

  data:{
    status:"FAILED",
  },

 });

 }


}