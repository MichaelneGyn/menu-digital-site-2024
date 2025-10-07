'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Search } from 'lucide-react';
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
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (selectedAddress) {
      setAddress(selectedAddress);
    }
  }, [selectedAddress]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador');
      setIsLoadingLocation(false);
      return;
    }

    // Solicitar permissão explícita
    toast.loading('Obtendo sua localização...', { id: 'geolocation' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('📍 Coordenadas obtidas:', { latitude, longitude });
        
        try {
          // Usando múltiplas APIs para melhor precisão
          // 1. Tentar Nominatim (OpenStreetMap)
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
            {
              headers: {
                'Accept-Language': 'pt-BR,pt;q=0.9'
              }
            }
          );
          const nominatimData = await nominatimResponse.json();
          
          console.log('🗺️ Dados do Nominatim:', nominatimData);
          
          if (nominatimData && nominatimData.address) {
            const addr = nominatimData.address;
            const newAddress: Address = {
              street: addr.road || addr.street || addr.pedestrian || addr.highway || '',
              number: addr.house_number || '',
              neighborhood: addr.suburb || addr.neighbourhood || addr.quarter || addr.district || '',
              city: addr.city || addr.town || addr.municipality || addr.village || '',
              zipCode: addr.postcode || '',
              coordinates: {
                lat: latitude,
                lng: longitude
              }
            };
            
            setAddress(newAddress);
            toast.success('✅ Localização obtida com sucesso!', { id: 'geolocation' });
            
            // Se encontrou CEP, tentar enriquecer com ViaCEP
            if (newAddress.zipCode) {
              enrichAddressWithViaCEP(newAddress.zipCode, newAddress);
            }
          } else {
            toast.error('Não foi possível obter o endereço desta localização', { id: 'geolocation' });
          }
        } catch (error) {
          console.error('Erro ao obter endereço:', error);
          toast.error('Erro ao obter endereço da localização', { id: 'geolocation' });
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        let errorMessage = 'Erro ao obter localização.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Habilite nas configurações do navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível no momento.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo esgotado ao obter localização. Tente novamente.';
            break;
        }
        
        toast.error(errorMessage, { id: 'geolocation' });
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      toast.error('Erro ao buscar endereços');
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

        {/* Botão de localização atual */}
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="w-full flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {isLoadingLocation ? 'Obtendo localização...' : 'Usar minha localização atual'}
        </Button>

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
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              type="text"
              value={address.zipCode}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange('zipCode', value);
                // Buscar endereço automaticamente quando CEP estiver completo
                const cleanCEP = value.replace(/\D/g, '');
                if (cleanCEP.length === 8) {
                  fetchAddressByCEP(cleanCEP);
                }
              }}
              placeholder="00000-000"
              maxLength={9}
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