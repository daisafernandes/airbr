import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-xl text-gray-600">Página não encontrada</p>
      <Link to="/">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  )
}
