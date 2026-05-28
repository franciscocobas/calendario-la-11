import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calendario Escolar - Inicial 4 - Escuela N° 11',
    short_name: 'Calendario La 11',
    description: 'Calendario de eventos para Inicial 4 de la Escuela N° 11',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/Escuela11_180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/Escuela11_192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Escuela11_512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
