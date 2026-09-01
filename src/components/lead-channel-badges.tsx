import type { Lead } from "@/data/examples";
import { leadContactChannels } from "@/lib/leads";

export function LeadChannelBadges({ lead }: { lead: Lead }) {
  const channels = leadContactChannels(lead);
  if (channels.length === 0) {
    return <span className="text-[11px] text-zinc-400">No contact</span>;
  }

  return (
    <span className="flex flex-wrap gap-1">
      {channels.map((channel) => (
        <span
          key={channel.id}
          className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-800"
        >
          {channel.label}
        </span>
      ))}
    </span>
  );
}
