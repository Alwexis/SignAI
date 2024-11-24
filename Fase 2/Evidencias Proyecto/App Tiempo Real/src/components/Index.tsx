import { useState } from 'react'
import Icon from './Icon'
//import { Button } from "@/components/ui/button"
//import { Input } from "@/components/ui/input"
//import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
//import { Label } from "@/components/ui/label"

export default function Home() {
  const [communicationType, setCommunicationType] = useState<string>('')
  const [roomCode, setRoomCode] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (communicationType && roomCode) {
      console.log('Ingresar a la sala', communicationType, roomCode)
      window.location.href = `/${communicationType}/${roomCode}`;
    }
  }

  const handleSelect = (type: string) => {
    setCommunicationType(type)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Selecciona el tipo de comunicación</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className='w-full flex items-center justify-between'>
            <div onClick={() => setCommunicationType('voz') } className={`${ communicationType == 'voz' ? 'bg-neutral-800 text-neutral-200' : '' } flex items-center h-24 w-36 cursor-pointer rounded-md hover:bg-neutral-800 hover:text-neutral-200 px-4 py-2 transition-all`}>
              <Icon icon="voice" className="w-12 h-12" />
              <span className='ml-2'>Voz</span>
            </div>
            <div onClick={() => setCommunicationType('señas') } className={`${ communicationType == 'señas' ? 'bg-neutral-800 text-neutral-200' : '' } flex items-center h-24 w-36 cursor-pointer rounded-md hover:bg-neutral-800 hover:text-neutral-200 px-4 py-2 transition-all`}>
              <Icon icon="camera" className="w-12 h-12" />
              <span className='ml-2'>Cámara</span>
            </div>
          </section>
          <input value={roomCode} onChange={(e: any) => setRoomCode(e.target.value)} required type="text" placeholder="Código de sala" className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50' />
          <button type="submit" className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2 w-full'>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
