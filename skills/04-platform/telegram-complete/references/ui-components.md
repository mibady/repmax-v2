# Telegram UI Components

## Setup

```bash
npm install @telegram-apps/telegram-ui
```

```tsx
import "@telegram-apps/telegram-ui/dist/styles.css";
import { AppRoot } from "@telegram-apps/telegram-ui";

function App() {
  return <AppRoot>{/* Your app */}</AppRoot>;
}
```

## Lists and Cells

Primary navigation pattern:

```tsx
import { List, Section, Cell, Avatar, Badge } from "@telegram-apps/telegram-ui";

<List>
  <Section header="Account">
    <Cell
      before={<Avatar src={user.photo} />}
      after={<Badge type="number">3</Badge>}
      subtitle="Premium member"
      onClick={() => openProfile()}
    >
      {user.name}
    </Cell>
  </Section>

  <Section header="Settings">
    <Cell after={<Switch checked={darkMode} />}>Dark Mode</Cell>
  </Section>
</List>;
```

## Buttons

```tsx
import { Button, ButtonCell } from '@telegram-apps/telegram-ui'

<Button mode="filled" size="l" onClick={submit}>
  Continue
</Button>

<Button mode="outline" size="m">
  Cancel
</Button>

<ButtonCell before={<Icon />} onClick={action}>
  Action Item
</ButtonCell>
```

## Inputs

```tsx
import { Input, Textarea, Select } from '@telegram-apps/telegram-ui'

<Input
  header="Email"
  placeholder="Enter email"
  value={email}
  onChange={setEmail}
  status={error ? 'error' : undefined}
/>

<Textarea
  header="Message"
  placeholder="Type here..."
  value={message}
  onChange={setMessage}
/>
```

## Placeholders

```tsx
import { Placeholder } from "@telegram-apps/telegram-ui";

<Placeholder
  header="No Results"
  description="Try a different search"
  action={<Button>Clear Search</Button>}
>
  <img src={emptyIcon} />
</Placeholder>;
```

## Modals

```tsx
import { Modal, ModalHeader, ModalClose } from "@telegram-apps/telegram-ui";

<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader after={<ModalClose />}>Select Option</ModalHeader>
  <List>
    {options.map((opt) => (
      <Cell key={opt.id} onClick={() => select(opt)}>
        {opt.name}
      </Cell>
    ))}
  </List>
</Modal>;
```

## Design Principles

- Touch targets: 44px minimum
- Use theme colors from `themeParams`
- Support light/dark modes
- iOS-style rounded corners
- Handle safe areas properly
