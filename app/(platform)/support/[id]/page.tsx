import TicketDetail from "@/components/support/ticket-detail";
export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetail id={id} />;
}
