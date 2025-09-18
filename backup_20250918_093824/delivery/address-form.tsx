'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
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
  onClose?: () => void;
}

export default function AddressForm({ onAddressSelect, selectedAddress, onClose }: AddressFormProps) {
  const [address, setAddress] = useState<Address>({
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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Primeiro tenta usar a API do Google Maps (mais precisa)
          let data;
          try {
            const googleResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=pt-BR&region=BR`
            );
            const googleData = await googleResponse.json();
            
            if (googleData.status === 'OK' && googleData.results.length > 0) {
              const result = googleData.results[0];
              const components = result.address_components;
              
              const getComponent = (types: string[]) => {
                const component = components.find((comp: any) => 
                  comp.types.some((type: string) => types.includes(type))
                );
                return component?.long_name || '';
              };
              
              const newAddress: Address = {
                street: getComponent(['route']),
                number: getComponent(['street_number']),
                neighborhood: getComponent(['sublocality', 'neighborhood']),
                city: getComponent(['locality', 'administrative_area_level_2']),
                zipCode: getComponent(['postal_code']),
                coordinates: {
                  lat: latitude,
                  lng: longitude
                }
              };
              
              setAddress(newAddress);
              toast.success('Localização obtida com precisão!');
              setIsLoadingLocation(false);
              return;
            }
          } catch (googleError) {
            console.log('Google Maps API não disponível, usando OpenStreetMap');
          }
          
          // Fallback para OpenStreetMap se Google Maps falhar
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`
          );
          data = await response.json();
          
          if (data && data.address) {
            const newAddress: Address = {
              street: data.address.road || data.address.pedestrian || '',
              number: data.address.house_number || '',
              neighborhood: data.address.suburb || data.address.neighbourhood || data.address.quarter || '',
              city: data.address.city || data.address.town || data.address.village || data.address.municipality || '',
              zipCode: data.address.postcode || '',
              coordinates: {
                lat: latitude,
                lng: longitude
              }
            };
            
            setAddress(newAddress);
            toast.success('Localização obtida com sucesso!');
          } else {
            toast.error('Não foi possível obter o endereço desta localização');
          }
        } catch (error) {
          console.error('Erro ao obter endereço:', error);
          toast.error('Erro ao obter endereço da localização');
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Verifique as configurações do navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Tente novamente.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo limite excedido. Tente novamente.';
            break;
        }
        
        toast.error(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Primeiro tenta usar Google Places API (mais precisa)
      let suggestions = [];
      
      try {
        if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&components=country:br&language=pt-BR&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const googleData = await googleResponse.json();
          
          if (googleData.status === 'OK') {
            suggestions = googleData.predictions.map((prediction: any) => ({
              display_name: prediction.description,
              place_id: prediction.place_id,
              isGoogle: true
            }));
          }
        }
      } catch (googleError) {
        console.log('Google Places API não disponível, usando OpenStreetMap');
      }
      
      // Fallback para OpenStreetMap se Google não estiver disponível
      if (suggestions.length === 0) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1&accept-language=pt-BR`
        );
        suggestions = await response.json();
      }
      
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      toast.error('Erro ao buscar endereços');
    }
    
    setIsSearching(false);
  };

  const selectSuggestion = async (suggestion: any) => {
    try {
      if (suggestion.isGoogle && suggestion.place_id) {
        // Para sugestões do Google, busca detalhes do lugar
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=address_components,geometry&language=pt-BR&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK') {
          const result = detailsData.result;
          const components = result.address_components;
          
          const getComponent = (types: string[]) => {
            const component = components.find((comp: any) => 
              comp.types.some((type: string) => types.includes(type))
            );
            return component?.long_name || '';
          };
          
          const newAddress: Address = {
            street: getComponent(['route']),
            number: getComponent(['street_number']),
            neighborhood: getComponent(['sublocality', 'neighborhood']),
            city: getComponent(['locality', 'administrative_area_level_2']),
            zipCode: getComponent(['postal_code']),
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            }
          };
          
          setAddress(newAddress);
          setSearchQuery(suggestion.display_name);
          setSuggestions([]);
          return;
        }
      }
      
      // Para sugestões do OpenStreetMap
      const newAddress: Address = {
        street: suggestion.address?.road || suggestion.address?.pedestrian || '',
        number: suggestion.address?.house_number || '',
        neighborhood: suggestion.address?.suburb || suggestion.address?.neighbourhood || suggestion.address?.quarter || '',
        city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || suggestion.address?.municipality || '',
        zipCode: suggestion.address?.postcode || '',
        coordinates: {
          lat: parseFloat(suggestion.lat),
          lng: parseFloat(suggestion.lon)
        }
      };
      
      setAddress(newAddress);
      setSearchQuery(suggestion.display_name);
      setSuggestions([]);
    } catch (error) {
      console.error('Erro ao selecionar endereço:', error);
      toast.error('Erro ao selecionar endereço');
    }
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
        <CardTitle className="flex items-center justify-between text-red-600 text-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço de Entrega
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
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
              className="pl-10 h-12 text-base"
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
          className="w-full flex items-center gap-2 h-12 text-base"
        >
          <Navigation className="w-4 h-4" />
          {isLoadingLocation ? 'Obtendo localização...' : 'Usar minha localização atual'}
        </Button>

        {/* Campos do endereço */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="street" className="text-sm font-medium">Rua *</Label>
            <Input
              id="street"
              type="text"
              value={address.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="Nome da rua"
              required
              className="h-12 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="number" className="text-sm font-medium">Número *</Label>
            <Input
              id="number"
              type="text"
              value={address.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="123"
              required
              className="h-12 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
            <Input
              id="complement"
              type="text"
              value={address.complement}
              onChange={(e) => handleInputChange('complement', e.target.value)}
              placeholder="Apto, bloco, etc."
              className="h-12 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="neighborhood" className="text-sm font-medium">Bairro *</Label>
            <Input
              id="neighborhood"
              type="text"
              value={address.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              placeholder="Nome do bairro"
              required
              className="h-12 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="city" className="text-sm font-medium">Cidade *</Label>
            <Input
              id="city"
              type="text"
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Nome da cidade"
              required
              className="h-12 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium">CEP</Label>
            <Input
              id="zipCode"
              type="text"
              value={address.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="00000-000"
              className="h-12 text-base mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 text-base font-medium"
          >
            Voltar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-base font-medium"
          >
            Confirmar Endereço
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}