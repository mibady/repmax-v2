# NativeWind (Tailwind CSS for React Native)

Tailwind CSS styling in React Native using NativeWind v4.

## Setup

### Installation

```bash
npm install nativewind tailwindcss
```

### Configuration Files

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// nativewind-env.d.ts
/// <reference types="nativewind/types" />
```

### Import Global CSS

```typescript
// app/_layout.tsx
import '../global.css';

export default function RootLayout() {
  // ...
}
```

## Basic Usage

```tsx
import { View, Text, Pressable } from 'react-native';

export function Component() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-2xl font-bold text-white">Hello</Text>
      <Pressable className="mt-4 rounded-xl bg-primary-500 px-6 py-3">
        <Text className="font-semibold text-white">Press Me</Text>
      </Pressable>
    </View>
  );
}
```

## Layout Classes

### Flexbox

```tsx
// Flex container
<View className="flex-1">              {/* flex: 1 */}
<View className="flex-row">            {/* flexDirection: row */}
<View className="flex-col">            {/* flexDirection: column (default) */}
<View className="flex-wrap">           {/* flexWrap: wrap */}

// Alignment
<View className="items-center">        {/* alignItems: center */}
<View className="items-start">         {/* alignItems: flex-start */}
<View className="items-end">           {/* alignItems: flex-end */}
<View className="justify-center">      {/* justifyContent: center */}
<View className="justify-between">     {/* justifyContent: space-between */}
<View className="justify-end">         {/* justifyContent: flex-end */}

// Combined
<View className="flex-1 items-center justify-center">
```

### Spacing

```tsx
// Margin
<View className="m-4">                 {/* margin: 16 */}
<View className="mx-4">                {/* marginHorizontal: 16 */}
<View className="my-4">                {/* marginVertical: 16 */}
<View className="mt-4 mb-2">           {/* marginTop: 16, marginBottom: 8 */}
<View className="ml-auto">             {/* marginLeft: auto (push right) */}

// Padding
<View className="p-4">                 {/* padding: 16 */}
<View className="px-6 py-3">           {/* paddingHorizontal: 24, paddingVertical: 12 */}

// Gap (in flex containers)
<View className="flex-row gap-4">      {/* gap: 16 between children */}
```

### Sizing

```tsx
// Width/Height
<View className="w-full">              {/* width: 100% */}
<View className="w-1/2">               {/* width: 50% */}
<View className="h-12">                {/* height: 48 */}
<View className="h-screen">            {/* height: 100% of screen */}
<View className="min-h-screen">        {/* minHeight: 100% of screen */}

// Fixed dimensions
<View className="h-20 w-20">           {/* 80x80 */}
```

## Typography

```tsx
// Size
<Text className="text-xs">             {/* fontSize: 12 */}
<Text className="text-sm">             {/* fontSize: 14 */}
<Text className="text-base">           {/* fontSize: 16 */}
<Text className="text-lg">             {/* fontSize: 18 */}
<Text className="text-xl">             {/* fontSize: 20 */}
<Text className="text-2xl">            {/* fontSize: 24 */}
<Text className="text-3xl">            {/* fontSize: 30 */}

// Weight
<Text className="font-normal">         {/* fontWeight: 400 */}
<Text className="font-medium">         {/* fontWeight: 500 */}
<Text className="font-semibold">       {/* fontWeight: 600 */}
<Text className="font-bold">           {/* fontWeight: 700 */}

// Color
<Text className="text-white">
<Text className="text-zinc-400">
<Text className="text-primary-500">

// Alignment
<Text className="text-center">
<Text className="text-right">

// Combined
<Text className="text-2xl font-bold text-white text-center">
```

## Colors

```tsx
// Background
<View className="bg-black">
<View className="bg-white">
<View className="bg-zinc-900">
<View className="bg-primary-500">
<View className="bg-primary-500/10">   {/* 10% opacity */}

// Text
<Text className="text-white">
<Text className="text-zinc-400">
<Text className="text-red-500">

// Border
<View className="border border-zinc-700">
<View className="border-2 border-primary-500">
```

## Borders & Shapes

```tsx
// Border radius
<View className="rounded">             {/* borderRadius: 4 */}
<View className="rounded-lg">          {/* borderRadius: 8 */}
<View className="rounded-xl">          {/* borderRadius: 12 */}
<View className="rounded-2xl">         {/* borderRadius: 16 */}
<View className="rounded-full">        {/* borderRadius: 9999 (circle) */}

// Border width
<View className="border">              {/* borderWidth: 1 */}
<View className="border-2">            {/* borderWidth: 2 */}
<View className="border-b">            {/* borderBottomWidth: 1 */}

// Combined
<View className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
```

## Dark Mode

```tsx
// Theme-aware styling
<View className="bg-white dark:bg-black">
<Text className="text-black dark:text-white">

// System preference (in root layout)
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <View className={colorScheme === 'dark' ? 'dark' : ''}>
      {/* App content */}
    </View>
  );
}
```

## Active/Pressed States

```tsx
<Pressable 
  className="bg-primary-500 active:bg-primary-600"
>
  <Text>Press Me</Text>
</Pressable>

// Disabled state
<Pressable 
  className="bg-primary-500 disabled:opacity-50"
  disabled={isLoading}
>
  <Text>Submit</Text>
</Pressable>
```

## Conditional Classes

### Using cn() Helper

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
import { cn } from '@/lib/utils';

<View className={cn(
  'rounded-xl p-4',
  isActive && 'bg-primary-500',
  isDisabled && 'opacity-50'
)}>

<Text className={cn(
  'text-base',
  variant === 'heading' && 'text-2xl font-bold',
  variant === 'muted' && 'text-sm text-zinc-400'
)}>
```

## Common Patterns

### Card

```tsx
<View className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
  <Text className="text-lg font-semibold text-white">Title</Text>
  <Text className="mt-2 text-zinc-400">Description</Text>
</View>
```

### Button

```tsx
<Pressable className="h-12 items-center justify-center rounded-xl bg-primary-500 px-6 active:bg-primary-600">
  <Text className="font-semibold text-white">Button</Text>
</Pressable>
```

### Input

```tsx
<TextInput
  className="h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-white"
  placeholderTextColor="#71717a"
  placeholder="Enter text..."
/>
```

### List Item

```tsx
<Pressable className="flex-row items-center justify-between border-b border-zinc-800 py-4">
  <View>
    <Text className="font-medium text-white">Title</Text>
    <Text className="text-sm text-zinc-400">Subtitle</Text>
  </View>
  <Ionicons name="chevron-forward" size={20} color="#71717a" />
</Pressable>
```

### Badge

```tsx
<View className="rounded-full bg-primary-500/10 px-3 py-1">
  <Text className="text-xs font-medium text-primary-500">Badge</Text>
</View>
```

### Avatar

```tsx
<View className="h-12 w-12 items-center justify-center rounded-full bg-primary-500">
  <Text className="text-lg font-bold text-white">JD</Text>
</View>
```

## Responsive Design

NativeWind supports breakpoints, but mobile-first is usually sufficient:

```tsx
// Platform-specific (if needed)
import { Platform } from 'react-native';

<View className={Platform.OS === 'ios' ? 'pt-12' : 'pt-6'}>
```

## Debugging

```tsx
// Add border to see layout
<View className="border border-red-500">

// Or background
<View className="bg-red-500/20">
```
