import { memo } from 'react';
import { useCart } from '../hooks/useCart';

const CartIcon = ({ className = "w-6 h-6", showCount = true }) => {
  const { totalItems } = useCart();

  return (
    <div className="relative">
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {showCount && totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(CartIcon, (prevProps, nextProps) => {
  return (
    prevProps.className === nextProps.className &&
    prevProps.showCount === nextProps.showCount
  );
});