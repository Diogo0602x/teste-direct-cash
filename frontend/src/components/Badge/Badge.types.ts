export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
};
