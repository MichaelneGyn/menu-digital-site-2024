'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
  customerName?: string;
  customerPhone?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressFormProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress?: Address;
}

export default function AddressForm({ onAddressSelect, selectedAddress }: AddressFormProps) {
  const [address, setAddress] = useState<Address>({
    customerName: '',
    customerPhone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    zipCode: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  useEffect(() => {
    if (selectedAddress) {
      setAddress(selectedAddress);
    }
  }, [selectedAddress]);

  const enrichAddressWithViaCEP = async (cep: string, currentAddress: Address) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) return;
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (data && !data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          zipCode: data.cep || prev.zipCode
        }));
      }
    } catch (error) {
      console.log('ViaCEP não disponível, usando dados do Nominatim');
    }
  };

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) return;
      
      setIsLoadingCEP(true);
      toast.loading('🔍 Buscando endereço...', { id: 'cep-search' });
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }
      
      const data = await response.json();
      
      if (data && !data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          zipCode: cleanCEP
        }));
        toast.success('✅ Endereço preenchido! Só falta o número.', { 
          id: 'cep-search',
          duration: 3000
        });
        
        // Focar no campo número após preencher
        setTimeout(() => {
          document.getElementById('number')?.focus();
        }, 100);
      } else {
        toast.error('❌ CEP não encontrado. Verifique e tente novamente.', { 
          id: 'cep-search',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('❌ Erro ao buscar CEP. Tente novamente.', { 
        id: 'cep-search',
        duration: 4000
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Usar API route proxy ao invés de chamar OpenStreetMap direto
      // Isso evita erros de CORS
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      // Não mostra erro ao usuário, apenas falha silenciosamente
      setSuggestions([]);
    }
    
    setIsSearching(false);
  };

  const selectSuggestion = (suggestion: any) => {
    const newAddress: Address = {
      street: suggestion.address?.road || '',
      number: suggestion.address?.house_number || '',
      neighborhood: suggestion.address?.suburb || suggestion.address?.neighbourhood || '',
      city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '',
      zipCode: suggestion.address?.postcode || '',
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      }
    };
    
    setAddress(newAddress);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    onAddressSelect(address);
    toast.success('Endereço de entrega definido!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <MapPin className="w-5 h-5" />
          Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dados do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <Label htmlFor="customerName">Nome *</Label>
            <Input
              id="customerName"
              type="text"
              value={address.customerName || ''}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Telefone/WhatsApp *</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={address.customerPhone || ''}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
        </div>

        {/* Busca de endereço */}
        <div className="relative">
          <Label htmlFor="search" className="text-sm font-medium">Buscar endereço</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder="Digite seu endereço..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchAddress(e.target.value);
              }}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Sugestões */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{suggestion.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dica de preenchimento */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-bold text-blue-900 mb-1">
                🚀 Preenchimento Rápido!
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Digite seu <strong className="font-bold bg-yellow-200 px-1 rounded">CEP</strong> no campo abaixo e a <strong>rua, bairro e cidade</strong> serão preenchidos automaticamente!
              </p>
              <p className="text-xs text-blue-700 mt-2 italic">
                Você só precisa digitar o número da casa 😊
              </p>
            </div>
          </div>
        </div>

        {/* Campos do endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              type="text"
              value={address.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="Nome da rua"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              type="text"
              value={address.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="123"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              type="text"
              value={address.complement}
              onChange={(e) => handleInputChange('complement', e.target.value)}
              placeholder="Apto, bloco, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              type="text"
              value={address.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              placeholder="Nome do bairro"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              type="text"
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Nome da cidade"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="zipCode" className="flex items-center gap-2">
              CEP * 
              <span className="text-xs text-gray-500 font-normal">
                (preenche automaticamente)
              </span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="zipCode"
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Aplicar máscara de CEP: 00000-000
                    value = value.replace(/\D/g, '');
                    if (value.length > 5) {
                      value = value.slice(0, 5) + '-' + value.slice(5, 8);
                    }
                    handleInputChange('zipCode', value);
                    
                    // Buscar automaticamente quando completar 8 dígitos
                    const cleanCEP = value.replace(/\D/g, '');
                    if (cleanCEP.length === 8) {
                      fetchAddressByCEP(cleanCEP);
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className={isLoadingCEP ? 'pr-10' : ''}
                  required
                />
                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => {
                  const cleanCEP = address.zipCode.replace(/\D/g, '');
                  if (cleanCEP.length === 8) {
                    fetchAddressByCEP(cleanCEP);
                  } else {
                    toast.error('Digite um CEP válido com 8 dígitos');
                  }
                }}
                disabled={isLoadingCEP}
                variant="outline"
                className="shrink-0"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Digite apenas os números. Ex: 01310100
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Confirmar Endereço
        </Button>
      </CardContent>
    </Card>
  );
}