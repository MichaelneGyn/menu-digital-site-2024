'use client';

import { useState, useEffect, useCallback } from 'react';
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
  restaurantId: string;
}

interface SavedCustomerProfile extends Address {
  normalizedPhone: string;
  updatedAt: string;
}

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

export default function AddressForm({ onAddressSelect, selectedAddress, restaurantId }: AddressFormProps) {
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
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const profilesStorageKey = `customer-profiles:${restaurantId}`;
  const lastPhoneStorageKey = `last-customer-phone:${restaurantId}`;

  const readProfiles = useCallback((): Record<string, SavedCustomerProfile> => {
    try {
      const raw = localStorage.getItem(profilesStorageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch {
      localStorage.removeItem(profilesStorageKey);
      return {};
    }
  }, [profilesStorageKey]);

  const writeProfiles = useCallback((profiles: Record<string, SavedCustomerProfile>) => {
    localStorage.setItem(profilesStorageKey, JSON.stringify(profiles));
  }, [profilesStorageKey]);

  const saveProfileLocally = useCallback((addressData: Address) => {
    const normalizedPhone = normalizePhone(addressData.customerPhone || '');
    if (normalizedPhone.length < 10) return;
    const profiles = readProfiles();
    profiles[normalizedPhone] = {
      ...addressData,
      normalizedPhone,
      updatedAt: new Date().toISOString(),
    };
    writeProfiles(profiles);
    localStorage.setItem(lastPhoneStorageKey, normalizedPhone);
  }, [lastPhoneStorageKey, readProfiles, writeProfiles]);

  const applySavedProfile = useCallback((profile: SavedCustomerProfile) => {
    setAddress(prev => ({
      ...prev,
      customerName: profile.customerName || '',
      customerPhone: profile.customerPhone || prev.customerPhone || '',
      street: profile.street || '',
      number: profile.number || '',
      complement: profile.complement || '',
      neighborhood: profile.neighborhood || '',
      city: profile.city || '',
      zipCode: profile.zipCode || '',
    }));
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      setAddress(selectedAddress);
      saveProfileLocally(selectedAddress);
      return;
    }
    const lastPhone = localStorage.getItem(lastPhoneStorageKey) || '';
    if (!lastPhone) return;
    const profiles = readProfiles();
    const profile = profiles[lastPhone];
    if (profile) {
      applySavedProfile(profile);
    }
  }, [selectedAddress, applySavedProfile, lastPhoneStorageKey, readProfiles, saveProfileLocally]);

  useEffect(() => {
    const phone = address.customerPhone || '';
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 10) return;

    const timeout = setTimeout(async () => {
      const profiles = readProfiles();
      const localProfile = profiles[normalizedPhone];
      if (localProfile) {
        applySavedProfile(localProfile);
        return;
      }

      try {
        const response = await fetch(
          `/api/orders/customer-profile?restaurantId=${restaurantId}&phone=${encodeURIComponent(phone)}`
        );
        if (!response.ok) return;

        const data = await response.json();
        if (!data?.found) return;

        const profileFromApi: SavedCustomerProfile = {
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || phone,
          street: data.street || '',
          number: data.number || '',
          complement: data.complement || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          zipCode: data.zipCode || '',
          normalizedPhone,
          updatedAt: new Date().toISOString(),
        };

        profiles[normalizedPhone] = profileFromApi;
        writeProfiles(profiles);
        localStorage.setItem(lastPhoneStorageKey, normalizedPhone);
        applySavedProfile(profileFromApi);
        toast.success('📌 Dados encontrados e preenchidos automaticamente');
      } catch (error) {
        console.error('Erro ao buscar perfil do cliente:', error);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [address.customerPhone, restaurantId, applySavedProfile, lastPhoneStorageKey, readProfiles, writeProfiles]);

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

  const handleInputChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    saveProfileLocally(address);
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
