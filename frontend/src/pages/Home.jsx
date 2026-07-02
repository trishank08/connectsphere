import { useCallback, useEffect, useRef, useState } from 'react'
import { postApi } from '../api/endpoints'
import CreatePostCard from '../components/CreatePostCard'
import PostCard from '../components/PostCard'
import StoryHighlights from '../components/StoryHighlights'
import RightSidebar from '../components/RightSidebar'
import { SkeletonPostCard } from '../components/SkeletonCard'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerRef = useRef(null)

  const loadPage = useCallback(async (pageNum) => {
    const { data } = await postApi.feed(pageNum, 8)
    const payload = data.data
    setPosts((prev) => (pageNum === 0 ? payload.content : [...prev, ...payload.content]))
    setHasMore(!payload.last)
  }, [])

  useEffect(() => {
    setLoading(true)
    loadPage(0).finally(() => setLoading(false))
  }, [loadPage])

  const loadMoreRef = useCallback((node) => {
    if (loadingMore || !hasMore) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true)
        const nextPage = page + 1
        await loadPage(nextPage)
        setPage(nextPage)
        setLoadingMore(false)
      }
    })
    if (node) observerRef.current.observe(node)
  }, [hasMore, loadingMore, page, loadPage])

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 max-w-2xl mx-auto space-y-5">
        <StoryHighlights />
        <CreatePostCard onPostCreated={(p) => setPosts((prev) => [p, ...prev])} />

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonPostCard key={i} />)
        ) : posts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-text-primary font-medium mb-1">Your feed is quiet right now</p>
            <p className="text-text-secondary text-sm">Add some friends or write your first post to get things going.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
          ))
        )}

        {hasMore && !loading && <div ref={loadMoreRef} className="h-4" />}
        {loadingMore && <SkeletonPostCard />}
      </div>

      <RightSidebar />
    </div>
  )
}
