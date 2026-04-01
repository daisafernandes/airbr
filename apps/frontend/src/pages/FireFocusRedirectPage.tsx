import { Navigate, useParams } from 'react-router-dom'

/** Old URLs `/mapa-queimadas/foco/:id` redirect to the map with `?foco=` so the modal opens. */
export const FireFocusRedirectPage = () => {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/mapa-queimadas" replace />
  return <Navigate to={`/mapa-queimadas?foco=${encodeURIComponent(id)}`} replace />
}
