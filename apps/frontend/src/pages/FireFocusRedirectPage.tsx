import { Navigate, useParams } from 'react-router-dom'

/** `/maps/foco/:id` redirects to `/maps?foco=` so the modal opens. */
export const FireFocusRedirectPage = () => {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/maps" replace />
  return <Navigate to={`/maps?foco=${encodeURIComponent(id)}`} replace />
}
