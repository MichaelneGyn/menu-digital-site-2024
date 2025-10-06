
'use client';

import { ClientRestaurant } from '@/lib/restaurant';

interface RestaurantFooterProps {
  restaurant: ClientRestaurant;
}

export default function RestaurantFooter({ restaurant }: RestaurantFooterProps) {
  return (
    <footer className="restaurant-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Sobre Nós</h3>
          <p>{restaurant?.description || 'Tradição e sabor em cada prato.'}</p>
          <div className="social-links">
            {restaurant?.facebook && (
              <a href={restaurant.facebook} className="social-link" target="_blank" rel="noopener noreferrer">
                📘
              </a>
            )}
            {restaurant?.instagram && (
              <a href={restaurant.instagram} className="social-link" target="_blank" rel="noopener noreferrer">
                📷
              </a>
            )}
            {restaurant?.twitter && (
              <a href={restaurant.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                🐦
              </a>
            )}
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Links Rápidos</h3>
          <ul>
            <li><a href="#promos">Promoções</a></li>
            <li><a href="#cardapio">Cardápio</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Horário de Funcionamento</h3>
          <p>{restaurant?.workingDays || 'Segunda a Domingo'}</p>
          <p>{restaurant?.openTime && restaurant?.closeTime ? 
            `${restaurant.openTime} às ${restaurant.closeTime}` : 
            'Horário não informado'
          }</p>
          {restaurant?.whatsapp && <p>📱 {restaurant.whatsapp}</p>}
        </div>
        
        <div className="footer-section">
          <h3>Localização</h3>
          <p>{restaurant?.address || 'Endereço não informado'}</p>
          <p>{restaurant?.city && restaurant?.state ? `${restaurant.city} - ${restaurant.state}` : ''}</p>
          {restaurant?.email && <p>✉️ {restaurant.email}</p>}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 {restaurant?.name} - Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
