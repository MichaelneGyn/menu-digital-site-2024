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
      
      toast.loading('Buscando endereço...', { id: 'cep-search' });
      
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
        toast.success('Endereço encontrado!', { id: 'cep-search' });
      } else {
        toast.error('CEP não encontrado', { id: 'cep-search' });
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP', { id: 'cep-search' });
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
          
          <div>
            <Label htmlFor="zipCode">CEP *</Label>
            <Input
              id="zipCode"
              type="text"
              value={address.zipCode}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange('zipCode', value);
              }}
              placeholder="Digite seu CEP"
              maxLength={9}
              required
            />
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