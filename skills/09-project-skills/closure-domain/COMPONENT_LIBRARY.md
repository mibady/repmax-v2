# CLOSURE - Component Library

## Table of Contents

1. [Component Philosophy](#component-philosophy)
2. [Base Components](#base-components)
3. [Form Components](#form-components)
4. [Feedback Components](#feedback-components)
5. [Navigation Components](#navigation-components)
6. [Feature Components](#feature-components)
7. [Layout Components](#layout-components)

---

## 1. Component Philosophy

### Design Principles

1. **Composable**: Build complex UIs from simple primitives
2. **Accessible**: WCAG 2.1 AA minimum, keyboard navigable
3. **Themeable**: Respect user theme and accessibility preferences
4. **Documented**: Props, variants, examples for every component
5. **Tested**: Unit tests for logic, integration tests for behavior

### Component Anatomy

```typescript
// Every component follows this structure

interface ComponentProps {
  // Required props (no defaults)
  children: React.ReactNode;

  // Optional props (with defaults)
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;

  // Styling
  className?: string;

  // Events
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  className,
  onClick,
}) => {
  return (
    <element
      className={cn('base-classes', variantClasses[variant], sizeClasses[size], className)}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </element>
  );
};
```

---

## 2. Base Components

### 2.1 Button

The most commonly used interactive element.

#### Variants

**Primary** - Main actions, high emphasis

```tsx
<Button variant="primary">Save Letter</Button>
```

- Background: `var(--color-primary-500)`
- Text: white
- Hover: Darken 10%, subtle lift
- Active: Darken 15%, inner shadow

**Secondary** - Alternative actions, medium emphasis

```tsx
<Button variant="secondary">Save Draft</Button>
```

- Background: transparent
- Border: `var(--color-border-medium)`
- Text: `var(--color-text-primary)`
- Hover: Background `var(--color-bg-tertiary)`

**Tertiary** - Low emphasis, inline actions

```tsx
<Button variant="tertiary">Cancel</Button>
```

- Background: transparent
- No border
- Text: `var(--color-text-secondary)`
- Hover: Underline

**Danger** - Destructive actions

```tsx
<Button variant="danger">Delete Forever</Button>
```

- Background: `var(--color-error-500)`
- Text: white
- Hover: Darken, lift

#### Sizes

```tsx
<Button size="sm">Small</Button>      {/* Padding: 8px 12px */}
<Button size="md">Medium</Button>     {/* Padding: 12px 16px (default) */}
<Button size="lg">Large</Button>      {/* Padding: 16px 24px */}
```

#### States

```tsx
{
  /* Loading */
}
<Button isLoading>
  <Spinner size={16} />
  Saving...
</Button>;

{
  /* Disabled */
}
<Button disabled>Cannot Save</Button>;

{
  /* With icon */
}
<Button>
  <Save size={20} aria-hidden="true" />
  Save Letter
</Button>;
```

#### Full Specification

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent) => void;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  ariaLabel,
  className,
  children,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'border border-border-medium bg-transparent text-text-primary hover:bg-bg-tertiary active:bg-bg-secondary focus-visible:ring-primary-500',
    tertiary: 'bg-transparent text-text-secondary hover:underline focus-visible:ring-primary-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus-visible:ring-error-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], widthClass, disabledClass, className)}
    >
      {isLoading && <Spinner size={16} className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Accessibility

- ✅ Keyboard accessible (Enter/Space)
- ✅ Clear focus indicator (2px ring)
- ✅ Minimum 44x44px touch target
- ✅ `aria-busy` when loading
- ✅ `disabled` attribute when disabled
- ✅ Proper contrast ratios (WCAG AA)

---

### 2.2 Card

Container for grouping related content.

#### Basic Usage

```tsx
<Card>
  <h3>Letters Unsent</h3>
  <p>Write what you never got to say.</p>
</Card>
```

#### Variants

**Default** - Standard elevation

```tsx
<Card variant="default">Content</Card>
```

- Background: `var(--color-bg-secondary)`
- Border: 1px solid `var(--color-border-light)`
- Shadow: `var(--shadow-sm)`
- Padding: `var(--space-6)` (24px)

**Elevated** - More prominent

```tsx
<Card variant="elevated">Important content</Card>
```

- Background: `var(--color-bg-elevated)`
- Shadow: `var(--shadow-md)`
- Hover: `var(--shadow-lg)`

**Flat** - No shadow, subtle border

```tsx
<Card variant="flat">Subtle content</Card>
```

- Border only, no shadow

**Interactive** - Clickable card

```tsx
<Card variant="interactive" onClick={() => selectMode("letters-unsent")}>
  <Heart size={32} />
  <h3>Letters Unsent</h3>
</Card>
```

- Hover: Lift effect, shadow increase
- Active: Scale down slightly
- Cursor: pointer

#### Full Specification

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  onClick,
  ariaLabel,
  className,
  children,
}) => {
  const baseClasses = 'rounded-lg transition-all';

  const variantClasses = {
    default: 'bg-bg-secondary border border-border-light shadow-sm',
    elevated: 'bg-bg-elevated shadow-md hover:shadow-lg',
    flat: 'bg-bg-secondary border border-border-light',
    interactive: 'bg-bg-secondary border border-border-light shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 cursor-pointer',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(baseClasses, variantClasses[variant], paddingClasses[padding], className)}
    >
      {children}
    </Component>
  );
};
```

---

## 3. Form Components

### 3.1 Input

Single-line text input.

#### Basic Usage

```tsx
<Input
  label="Recipient"
  name="recipient"
  value={recipient}
  onChange={(e) => setRecipient(e.target.value)}
  placeholder="e.g., Mom, my younger self, my ex-partner"
/>
```

#### Variants & States

```tsx
{
  /* With helper text */
}
<Input
  label="Email"
  helperText="We'll only use this for time capsule delivery"
  type="email"
/>;

{
  /* With error */
}
<Input label="Name" error="Name is required" hasError />;

{
  /* Disabled */
}
<Input label="Archived" value="Cannot edit" disabled />;

{
  /* With icon */
}
<Input label="Search" leftIcon={<Search size={20} />} />;
```

#### Full Specification

```typescript
interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  placeholder?: string;
  helperText?: string;
  error?: string;
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;

  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  helperText,
  error,
  hasError = false,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  autoComplete,
  autoFocus,
  maxLength,
  className,
}) => {
  const inputId = `input-${name}`;
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-primary"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          aria-describedby={cn(
            helperText && helperTextId,
            (error || hasError) && errorId
          )}
          aria-invalid={hasError || !!error}
          className={cn(
            'w-full px-4 py-3 rounded-md border transition-all',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            (hasError || error) && 'border-error-500 focus:ring-error-500',
            !hasError && !error && 'border-border-medium',
            disabled && 'bg-bg-tertiary cursor-not-allowed opacity-60'
          )}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p id={helperTextId} className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

#### Accessibility

- ✅ Label properly associated (`htmlFor` / `id`)
- ✅ Helper text linked via `aria-describedby`
- ✅ Error state indicated via `aria-invalid`
- ✅ Error messages announced via `role="alert"`
- ✅ Required fields marked visually and semantically
- ✅ Focus indicator clearly visible

---

### 3.2 Textarea

Multi-line text input for longer content.

#### Basic Usage

```tsx
<Textarea
  label="Your letter"
  name="content"
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder="Dear..."
  rows={10}
/>
```

#### With Auto-Resize

```tsx
<Textarea label="Reflection" autoResize minRows={5} maxRows={20} />
```

#### With Character Count

```tsx
<Textarea label="Message" maxLength={500} showCharCount />
```

#### Full Specification

```typescript
interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

  placeholder?: string;
  helperText?: string;
  error?: string;
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;

  rows?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;

  maxLength?: number;
  showCharCount?: boolean;

  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  hasError = false,
  disabled = false,
  required = false,
  rows = 5,
  autoResize = false,
  minRows = 3,
  maxRows = 20,
  maxLength,
  showCharCount = false,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = `textarea-${name}`;

  // Auto-resize logic
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [value, autoResize, minRows, maxRows]);

  const charCount = value.length;
  const isNearLimit = maxLength && charCount / maxLength > 0.9;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      <textarea
        ref={textareaRef}
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={autoResize ? minRows : rows}
        maxLength={maxLength}
        aria-invalid={hasError || !!error}
        className={cn(
          'w-full px-4 py-3 rounded-md border transition-all resize-none',
          'text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          (hasError || error) && 'border-error-500 focus:ring-error-500',
          !hasError && !error && 'border-border-medium',
          disabled && 'bg-bg-tertiary cursor-not-allowed opacity-60',
          !autoResize && 'resize-y'
        )}
      />

      <div className="flex justify-between items-center">
        {helperText && !error && (
          <p className="text-sm text-text-secondary">{helperText}</p>
        )}

        {error && (
          <p className="text-sm text-error-500" role="alert">{error}</p>
        )}

        {showCharCount && maxLength && (
          <p className={cn(
            'text-sm ml-auto',
            isNearLimit ? 'text-warning-500' : 'text-text-tertiary'
          )}>
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
};
```

---

### 3.3 Select

Dropdown menu for choosing from predefined options.

#### Basic Usage

```tsx
<Select
  label="Tone"
  name="tone"
  value={tone}
  onChange={(value) => setTone(value)}
  options={[
    { value: "grounded", label: "Grounded" },
    { value: "reflective", label: "Reflective" },
    { value: "poetic", label: "Poetic" },
    { value: "minimal", label: "Minimal" },
  ]}
/>
```

#### With Descriptions

```tsx
<Select
  label="Loss Type"
  options={[
    {
      value: "death",
      label: "Death",
      description: "Processing the loss of someone who passed away",
    },
    {
      value: "estrangement",
      label: "Estrangement",
      description:
        "A relationship that ended while both people are still alive",
    },
  ]}
/>
```

#### Full Specification

```typescript
interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];

  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;

  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  helperText,
  error,
  required = false,
  disabled = false,
  className,
}) => {
  const selectId = `select-${name}`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        className={cn(
          'w-full px-4 py-3 rounded-md border transition-all appearance-none bg-white',
          'text-text-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error && 'border-error-500 focus:ring-error-500',
          !error && 'border-border-medium',
          disabled && 'bg-bg-tertiary cursor-not-allowed opacity-60'
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <p className="text-sm text-text-secondary">{helperText}</p>
      )}

      {error && (
        <p className="text-sm text-error-500" role="alert">{error}</p>
      )}
    </div>
  );
};
```

---

## 4. Feedback Components

### 4.1 Toast

Brief notifications for user feedback.

#### Usage

```tsx
// In your store or context
const { showToast } = useAppStore();

// Trigger toast
showToast({
  message: "Letter saved successfully",
  variant: "success",
  duration: 3000,
});
```

#### Variants

```tsx
// Success
showToast({
  message: "Changes saved",
  variant: "success",
});

// Error
showToast({
  message: "Failed to save. Please try again.",
  variant: "error",
});

// Warning
showToast({
  message: "You have unsaved changes",
  variant: "warning",
});

// Info
showToast({
  message: "Tip: Use Ctrl+S to save",
  variant: "info",
});
```

#### Full Component

```typescript
interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <Check size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const variantClasses = {
    success: 'bg-success-50 text-success-700 border-success-500',
    error: 'bg-error-50 text-error-700 border-error-500',
    warning: 'bg-warning-50 text-warning-700 border-warning-500',
    info: 'bg-info-50 text-info-700 border-info-500',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg',
        'animate-slide-up',
        variantClasses[variant]
      )}
    >
      {icons[variant]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-70"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
```

---

### 4.2 Modal

Overlay dialog for focused interactions.

#### Basic Usage

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Letter?">
  <p>Are you sure you want to delete this letter? This cannot be undone.</p>
  <div className="flex gap-3 mt-6">
    <Button variant="danger" onClick={handleDelete}>
      Delete Forever
    </Button>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
  </div>
</Modal>
```

#### Full Specification

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
}) => {
  // Focus trap
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Trap focus inside modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      firstElement?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative z-10 w-full bg-bg-elevated rounded-2xl shadow-xl',
          'animate-modal-enter',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-bg-tertiary rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
```

---

## 5. Navigation Components

### 5.1 Tabs

Switch between different views or sections.

#### Usage

```tsx
const [activeTab, setActiveTab] = useState("letters");

<Tabs
  tabs={[
    { id: "letters", label: "Letters", count: 12 },
    { id: "conversations", label: "Conversations", count: 5 },
    { id: "rituals", label: "Rituals", count: 3 },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>;

{
  /* Content based on active tab */
}
{
  activeTab === "letters" && <LettersList />;
}
{
  activeTab === "conversations" && <ConversationsList />;
}
```

#### Full Component

```typescript
interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
}) => {
  return (
    <div role="tablist" className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 font-medium transition-all focus:outline-none focus-visible:ring-2',
            variant === 'underline' && [
              'border-b-2',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            ],
            variant === 'pills' && [
              'rounded-md',
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-transparent text-text-secondary hover:bg-bg-tertiary',
            ],
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-bg-tertiary">
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
```

---

## 6. Feature Components

### 6.1 MoodCheckIn

3-step mood tracking experience.

#### Usage

```tsx
<MoodCheckIn
  onComplete={(moodEntry) => {
    saveMoodEntry(moodEntry);
    showToast({ message: "Mood logged", variant: "success" });
  }}
  onSkip={() => {
    setView("dashboard");
  }}
/>
```

**See implementation in:** `src/components/features/MoodCheckIn.tsx`

**Features:**

- Step 1: Select primary emotion (12 options with icons)
- Step 2: Add up to 3 secondary emotions (optional)
- Step 3: Rate intensity (1-10) and energy level (1-10)
- Beautiful gradient background
- Progress indicators
- Skip option at every step

---

### 6.2 CrisisBanner

Compassionate crisis resource display.

#### Usage

```tsx
{
  showCrisisResources && (
    <CrisisBanner onDismiss={() => setShowCrisisResources(false)} />
  );
}
```

#### Full Component

```typescript
export const CrisisBanner: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const { t, i18n } = useTranslation();
  const resources = CRISIS_RESOURCES[i18n.language] || CRISIS_RESOURCES['en'];

  return (
    <div
      role="alert"
      className="bg-crisis-bg border-l-4 border-crisis-border p-4 rounded-lg mb-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={24} className="text-crisis-text flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          <h3 className="font-semibold text-crisis-text mb-2">
            {t('crisis.title', 'You\'re Not Alone')}
          </h3>

          <p className="text-sm text-text-primary mb-3">
            {t('crisis.message', 'If you\'re having thoughts of suicide or self-harm, please reach out to a professional immediately.')}
          </p>

          <div className="flex flex-col gap-2">
            <a
              href={`tel:${resources.hotline}`}
              className="text-sm font-medium text-primary-500 hover:underline"
            >
              📞 {resources.hotlineName}: {resources.hotline}
            </a>

            <p className="text-sm text-text-secondary">
              💬 {resources.textLineName}: {resources.textLine}
            </p>

            <a
              href={resources.international}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-500 hover:underline"
            >
              🌍 {t('crisis.international', 'International Resources')}
            </a>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-text-tertiary hover:text-text-primary"
          aria-label="Dismiss crisis resources"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
```

---

## 7. Layout Components

### 7.1 Header

App header with navigation and settings.

```typescript
export const Header: React.FC = () => {
  const { preferences, updatePreferences } = useAppStore();

  return (
    <header className="sticky top-0 z-40 bg-bg-elevated border-b border-border-light shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Heart size={24} className="text-primary-500" />
          <h1 className="text-xl font-semibold text-text-primary">
            CLOSURE
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => updatePreferences({ darkMode: !preferences.darkMode })}
            className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
            aria-label={preferences.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {preferences.darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
```

---

### 7.2 Container

Responsive content container.

```typescript
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'reading';
  className?: string;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  className,
  children,
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',     // 640px
    md: 'max-w-screen-md',     // 768px
    lg: 'max-w-screen-lg',     // 1024px
    xl: 'max-w-screen-xl',     // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    reading: 'max-w-prose',    // ~65ch
  };

  return (
    <div className={cn('mx-auto px-4 w-full', sizeClasses[size], className)}>
      {children}
    </div>
  );
};
```

---

## Summary

This component library provides:

1. ✅ **Base Components**: Button, Card (4 variants each)
2. ✅ **Form Components**: Input, Textarea, Select (with full validation)
3. ✅ **Feedback**: Toast, Modal (with focus trapping)
4. ✅ **Navigation**: Tabs (2 variants)
5. ✅ **Features**: MoodCheckIn, CrisisBanner
6. ✅ **Layout**: Header, Container

**All components are:**

- Fully typed with TypeScript
- WCAG 2.1 AA accessible
- Keyboard navigable
- Theme-aware
- Responsive
- Documented with examples

**Next: UX Patterns & User Flows**
