import { useEffect, useState } from "react";
import { deleteAdminReview, getAdminReviews, setAdminReviewStatus, type AdminReview } from "../services/adminReviewService";

export default function ReviewModeration() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = async () => { try { setError(""); setReviews(await getAdminReviews()); } catch (error) { setError(error instanceof Error ? error.message : "Failed to load reviews"); } };
  useEffect(() => { void load(); }, []);
  const setStatus = async (id: string, status: AdminReview["status"]) => { try { setBusyId(id); const updated = await setAdminReviewStatus(id, status); setReviews((all) => all.map((review) => review.id === id ? updated : review)); } catch (error) { setError(error instanceof Error ? error.message : "Unable to update review"); } finally { setBusyId(null); } };
  const remove = async (id: string) => { if (!window.confirm("Delete this review permanently?")) return; try { setBusyId(id); await deleteAdminReview(id); setReviews((all) => all.filter((review) => review.id !== id)); } catch (error) { setError(error instanceof Error ? error.message : "Unable to delete review"); } finally { setBusyId(null); } };
  return <section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm sm:mt-8">
    <div className="flex items-center justify-between border-b border-black/10 p-5"><div><h2 className="text-xl font-semibold">Review moderation</h2><p className="mt-1 text-sm text-black/60">Approve, hide, or permanently remove customer reviews.</p></div><button type="button" onClick={() => void load()} className="border border-black/15 px-4 py-2 text-sm font-semibold">Refresh</button></div>
    {error && <p className="m-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {reviews.length === 0 ? <p className="p-5 text-sm text-black/60">No submitted reviews.</p> : <div className="divide-y divide-black/10">{reviews.map((review) => <article key={review.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{review.guestName} · {"★".repeat(review.rating)}</p><p className="text-sm text-black/60">{review.product.name} · {new Date(review.createdAt).toLocaleDateString("en-IN")}</p></div><span className="rounded-full bg-[#F7F3EA] px-3 py-1 text-xs font-semibold">{review.status}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{review.comment}</p><div className="mt-4 flex flex-wrap gap-2"><button disabled={busyId === review.id} type="button" onClick={() => void setStatus(review.id, "APPROVED")} className="bg-[#0B0B0B] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={busyId === review.id} type="button" onClick={() => void setStatus(review.id, "HIDDEN")} className="border border-black/15 px-3 py-2 text-xs font-semibold disabled:opacity-50">Hide</button><button disabled={busyId === review.id} type="button" onClick={() => void remove(review.id)} className="border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Delete</button></div></article>)}</div>}
  </section>;
}
