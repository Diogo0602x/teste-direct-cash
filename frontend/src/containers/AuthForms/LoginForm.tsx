'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Box, Typography, Input, Button } from '@/components';
import { useAuth } from '@/hooks';
import { loginSchema, type LoginFormValues } from '@/utils';

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    await login(values);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
    >
      <Box className="flex flex-col gap-1">
        <Typography variant="h3" weight="bold" className="text-neutral-900">
          Entrar
        </Typography>
        <Typography variant="body2" className="text-neutral-500">
          Acesse sua conta para continuar
        </Typography>
      </Box>

      {error && (
        <Box
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <Typography variant="body2" className="text-red-600">
            {error}
          </Typography>
        </Box>
      )}

      <Box className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          fullWidth
          leftElement={<Mail size={16} />}
          errorMessage={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          fullWidth
          leftElement={<Lock size={16} />}
          rightElement={
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              leftIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            />
          }
          errorMessage={errors.password?.message}
          {...register('password')}
        />
      </Box>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Entrar
      </Button>
    </Box>
  );
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;
