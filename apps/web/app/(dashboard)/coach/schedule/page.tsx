import { redirect } from 'next/navigation';

export default function SchedulePage(): never {
  redirect('/coach/tasks');
}
