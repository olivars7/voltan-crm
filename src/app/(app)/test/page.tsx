'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type ConnectionStatus = 'loading' | 'success' | 'error';

export default function TestPage() {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [message, setMessage] = useState('Intentando conectar a la base de datos...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch a small amount of data to test the connection
        await getDocs(collection(db, 'clientes'));
        setStatus('success');
        setMessage('¡Conexión a la base de datos exitosa!');
      } catch (error: any) {
        setStatus('error');
        setMessage(`Error al conectar a la base de datos: ${error.message}`);
        console.error(error);
      }
    };

    testConnection();
  }, []);

  const StatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-status-success" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-status-danger" />;
    }
  };

  const cardBorderColor = () => {
      switch (status) {
          case 'loading': return 'border-primary/50';
          case 'success': return 'border-status-success/50';
          case 'error': return 'border-status-danger/50';
      }
  }

  return (
    <>
      <PageHeader
        title="Prueba de Conexión"
        description="Verificando la conexión con la base de datos de Firebase."
      />
      <div className="flex items-center justify-center pt-10">
        <Card className={`w-full max-w-md text-center transition-colors ${cardBorderColor()}`}>
          <CardHeader>
            <CardTitle>Estado de la Conexión</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-6 p-10">
            <StatusIcon />
            <p className="text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
