'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage('Um email com instruções para redefinir sua senha foi enviado.')
      } else {
        setMessage(data.error || 'Erro ao enviar email de recuperação.')
      }
    } catch (error) {
      setMessage('Erro interno do servidor. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Esqueci minha senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {message && !isSuccess && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-red-500 hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
              </Button>

              <div className="text-center">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}