# UI Components for React Native

Reusable UI components with NativeWind styling.

## Button

```typescript
// components/ui/button.tsx
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends PressableProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variants = {
  default: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-zinc-800 active:bg-zinc-700',
  outline: 'border border-zinc-700 bg-transparent active:bg-zinc-800',
  ghost: 'bg-transparent active:bg-zinc-800',
  destructive: 'bg-red-600 active:bg-red-700',
};

const textVariants = {
  default: 'text-white',
  secondary: 'text-white',
  outline: 'text-white',
  ghost: 'text-white',
  destructive: 'text-white',
};

const sizes = {
  default: 'h-12 px-6',
  sm: 'h-10 px-4',
  lg: 'h-14 px-8',
};

const textSizes = {
  default: 'text-base',
  sm: 'text-sm',
  lg: 'text-lg',
};

export function Button({
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : typeof children === 'string' ? (
        <Text className={cn('font-semibold', textVariants[variant], textSizes[size])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
```

**Usage:**
```tsx
<Button onPress={handlePress}>Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="destructive" isLoading={isDeleting}>Delete</Button>
<Button disabled>Disabled</Button>
```

## Input

```typescript
// components/ui/input.tsx
import { forwardRef } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <View className={cn('w-full', containerClassName)}>
        {label && (
          <Text className="mb-2 text-sm font-medium text-zinc-300">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'h-12 w-full rounded-xl border bg-zinc-900 px-4 text-base text-white',
            error ? 'border-red-500' : 'border-zinc-700',
            className
          )}
          placeholderTextColor="#71717a"
          {...props}
        />
        {error && (
          <Text className="mt-1.5 text-sm text-red-500">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
```

**Usage:**
```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  error={errors.email}
/>

<Input
  label="Password"
  placeholder="••••••••"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

## Card

```typescript
// components/ui/card.tsx
import { View, Text, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-zinc-800 bg-zinc-900 p-4', className)}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('mb-3', className)} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text className={cn('text-sm text-zinc-400', className)}>
      {children}
    </Text>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('', className)} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('mt-4 flex-row items-center', className)} {...props}>
      {children}
    </View>
  );
}
```

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Account Settings</CardTitle>
    <CardDescription>Manage your account preferences</CardDescription>
  </CardHeader>
  <CardContent>
    <Text className="text-white">Content here</Text>
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

## Loading

```typescript
// components/ui/loading.tsx
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  className?: string;
}

export function Loading({
  message,
  fullScreen = false,
  size = 'large',
  className,
}: LoadingProps) {
  return (
    <View
      className={cn(
        'items-center justify-center',
        fullScreen && 'flex-1 bg-black',
        className
      )}
    >
      <ActivityIndicator size={size} color="#0ea5e9" />
      {message && (
        <Text className="mt-3 text-zinc-400">{message}</Text>
      )}
    </View>
  );
}
```

**Usage:**
```tsx
<Loading />
<Loading message="Loading data..." />
<Loading fullScreen message="Please wait..." />
```

## Avatar

```typescript
// components/ui/avatar.tsx
import { View, Text, Image } from 'react-native';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-2xl',
};

export function Avatar({ src, name = '', size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <Image
        source={{ uri: src }}
        className={cn('rounded-full bg-zinc-800', sizes[size], className)}
      />
    );
  }

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full bg-primary-500',
        sizes[size],
        className
      )}
    >
      <Text className={cn('font-bold text-white', textSizes[size])}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
```

**Usage:**
```tsx
<Avatar name="John Doe" />
<Avatar src="https://example.com/avatar.jpg" size="lg" />
```

## Badge

```typescript
// components/ui/badge.tsx
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variants = {
  default: 'bg-primary-500/10 text-primary-500',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
  error: 'bg-red-500/10 text-red-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <View className={cn('rounded-full px-3 py-1', variants[variant].split(' ')[0], className)}>
      <Text className={cn('text-xs font-medium', variants[variant].split(' ')[1])}>
        {children}
      </Text>
    </View>
  );
}
```

**Usage:**
```tsx
<Badge>Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

## Icon Button

```typescript
// components/ui/icon-button.tsx
import { Pressable, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface IconButtonProps extends PressableProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  variant?: 'default' | 'ghost';
  className?: string;
}

export function IconButton({
  icon,
  size = 24,
  color = '#fff',
  variant = 'default',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={cn(
        'items-center justify-center rounded-full p-2',
        variant === 'default' && 'bg-zinc-800 active:bg-zinc-700',
        variant === 'ghost' && 'active:bg-zinc-800',
        className
      )}
      {...props}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}
```

**Usage:**
```tsx
<IconButton icon="settings-outline" onPress={openSettings} />
<IconButton icon="arrow-back" variant="ghost" onPress={goBack} />
```

## Divider

```typescript
// components/ui/divider.tsx
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <View className={cn('flex-row items-center', className)}>
        <View className="h-px flex-1 bg-zinc-800" />
        <Text className="mx-4 text-sm text-zinc-500">{label}</Text>
        <View className="h-px flex-1 bg-zinc-800" />
      </View>
    );
  }

  return <View className={cn('h-px bg-zinc-800', className)} />;
}
```

**Usage:**
```tsx
<Divider />
<Divider label="or" />
```

## Empty State

```typescript
// components/ui/empty-state.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center py-12', className)}>
      <Ionicons name={icon} size={48} color="#71717a" />
      <Text className="mt-4 text-lg font-medium text-white">{title}</Text>
      {description && (
        <Text className="mt-2 text-center text-zinc-400">{description}</Text>
      )}
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
```

**Usage:**
```tsx
<EmptyState
  icon="search-outline"
  title="No results found"
  description="Try adjusting your search terms"
  action={<Button variant="secondary">Clear Search</Button>}
/>
```

## Components Index

```typescript
// components/ui/index.ts
export * from './button';
export * from './input';
export * from './card';
export * from './loading';
export * from './avatar';
export * from './badge';
export * from './icon-button';
export * from './divider';
export * from './empty-state';
```

## Utils (cn helper)

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```
