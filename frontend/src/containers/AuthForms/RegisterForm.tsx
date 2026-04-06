'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Box, Typography, Input, Button } from '@/components';
import { useAuth } from '@/hooks';
import { registerSchema, type RegisterFormValues } from '@/utils';

const RegisterForm: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    await registerUser(values);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
    >
      <Box className="flex flex-col gap-1">
        <Typography variant="h3" weight="bold" className="text-neutral-900">
          Criar conta
        </Typography>
        <Typography variant="body2" className="text-neutral-500">
          Junte-se à comunidade Fé Viva
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
          label="Nome completo"
          type="text"
          placeholder="Seu nome"
          fullWidth
          leftElement={<User size={16} />}
          errorMessage={errors.name?.message}
          {...register('name')}
        />

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
          placeholder="Mínimo 8 caracteres"
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
          helperText="Mínimo de 8 caracteres"
          errorMessage={errors.password?.message}
          {...register('password')}
        />
      </Box>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Criar conta
      </Button>
    </Box>
  );
};

RegisterForm.displayName = 'RegisterForm';

export default RegisterForm;
