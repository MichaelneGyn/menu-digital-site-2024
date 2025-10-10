'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type ImportResult = {
  success: number;
  errors: Array<{ line: number; error: string }>;
  items: Array<{ name: string; price: number }>;
};

export default function ImportMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.replace('/auth/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar extensão
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv' && extension !== 'xlsx') {
        toast.error('Formato inválido! Use CSV ou XLSX');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/menu/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Erro ao importar');
      }

      const data: ImportResult = await res.json();
      setResult(data);

      if (data.success > 0) {
        toast.success(`✅ ${data.success} itens importados com sucesso!`);
      }

      if (data.errors.length > 0) {
        toast.error(`⚠️ ${data.errors.length} erros encontrados`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Nome,Descrição,Preço,Categoria,Imagem (URL),É Promoção?,Preço Original
Pizza Margherita,Molho de tomate e queijo mussarela,35.90,Pizzas,https://exemplo.com/pizza.jpg,não,
Pizza Calabresa,Molho e calabresa fatiada,39.90,Pizzas,https://exemplo.com/calabresa.jpg,sim,45.90
Hambúrguer Clássico,Pão hambúrguer e carne bovina,25.00,Lanches,https://exemplo.com/burger.jpg,não,
Refrigerante Lata,Coca-Cola 350ml,5.00,Bebidas,,não,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-cardapio.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">📤 Importar Cardápio em Massa</CardTitle>
            <CardDescription>
              Adicione vários itens ao seu cardápio de uma só vez usando um arquivo CSV ou Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Download Template */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                📋 Passo 1: Baixe o Template
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Baixe nosso modelo de exemplo e preencha com seus produtos
              </p>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Template CSV
              </Button>
            </div>

            {/* Upload File */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="font-semibold text-gray-900 mb-2">
                📁 Passo 2: Selecione o Arquivo
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Formatos aceitos: CSV ou XLSX
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Escolher Arquivo
                    </span>
                  </Button>
                </label>
                {file && (
                  <span className="text-sm text-gray-700">
                    ✓ {file.name}
                  </span>
                )}
              </div>
            </div>

            {/* Import Button */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">
                🚀 Passo 3: Importar
              </h3>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Cardápio
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {result.success > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        {result.success} itens importados com sucesso!
                      </h4>
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      {result.items.slice(0, 5).map((item, idx) => (
                        <div key={idx}>
                          • {item.name} - R$ {item.price.toFixed(2)}
                        </div>
                      ))}
                      {result.items.length > 5 && (
                        <div className="text-xs text-green-700 mt-2">
                          ... e mais {result.items.length - 5} itens
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-900">
                        {result.errors.length} erro(s) encontrado(s)
                      </h4>
                    </div>
                    <div className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, idx) => (
                        <div key={idx}>
                          • Linha {error.line}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => router.push('/admin/dashboard')}
                  variant="outline"
                >
                  Voltar para Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Como usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>1.</strong> Baixe o template CSV clicando no botão azul</p>
              <p><strong>2.</strong> Abra o arquivo no Excel ou Google Sheets</p>
              <p><strong>3.</strong> Preencha com os dados dos seus produtos:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Nome:</strong> Nome do produto (obrigatório)</li>
                <li><strong>Descrição:</strong> Descrição do produto</li>
                <li><strong>Preço:</strong> Preço em reais (ex: 35.90)</li>
                <li><strong>Categoria:</strong> Nome da categoria (será criada se não existir)</li>
                <li><strong>Imagem (URL):</strong> Link da imagem (opcional)</li>
                <li><strong>É Promoção?:</strong> "sim" ou "não"</li>
                <li><strong>Preço Original:</strong> Preço antes da promoção (se aplicável)</li>
              </ul>
              <p><strong>4.</strong> Salve o arquivo como CSV</p>
              <p><strong>5.</strong> Faça o upload aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
