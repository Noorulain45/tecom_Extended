import React from 'react';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const Footer = () => (
  <footer className="bg-[#F4F4F4] border-t border-gray-200 font-montserrat">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      {/* 4-column grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Collections */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-5">Collections</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Black teas',  to: '/shop?category=black-tea' },
              { label: 'Green teas',  to: '/shop?category=green-tea' },
              { label: 'White teas',  to: '/shop?category=white-tea' },
              { label: 'Herbal teas', to: '/shop?category=herbal-tea' },
              { label: 'Matcha',      to: '/shop?category=matcha' },
              { label: 'Chai',        to: '/shop?category=chai' },
              { label: 'Oolong',      to: '/shop?category=oolong-tea' },
              { label: 'Rooibos',     to: '/shop?category=rooibos' },
              { label: 'Teaware',     to: '/shop?category=teaware' },
            ].map(item => (
              <li key={item.label}>
                <Link to={item.to} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Learn */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-5">Learn</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'About us',      to: '/about' },
              { label: 'About our teas', to: '/about-teas' },
              { label: 'Tea academy',   to: '/academy' },
            ].map(item => (
              <li key={item.label}>
                <Link to={item.to} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-5">Customer Service</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Ordering and payment', to: '/help/ordering' },
              { label: 'Delivery',             to: '/help/delivery' },
              { label: 'Privacy and policy',   to: '/privacy' },
              { label: 'Terms & Conditions',   to: '/terms' },
            ].map(item => (
              <li key={item.label}>
                <Link to={item.to} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-5">Contact Us</h4>
          <ul className="space-y-3.5">
            <li className="flex items-start gap-2.5">
              <LocationOnIcon sx={{ fontSize: 16 }} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-500 leading-snug">
                3 Falahi, Falahi St, Pasdaran Ave,<br />
                Shiraz, Fars Providence<br />
                Iran
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <EmailIcon sx={{ fontSize: 16 }} className="text-gray-400 flex-shrink-0" />
              <a href="mailto:amoopur@gmail.com" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Email: amoopur@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon sx={{ fontSize: 16 }} className="text-gray-400 flex-shrink-0" />
              <a href="tel:+989173038406" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Tel: +98 9173038406
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </footer>
);

export default Footer;