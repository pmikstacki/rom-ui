export interface FlowChoiceData extends Record<string, unknown> {
  label: string;
  stage?: string;
  selected?: boolean;
  muted?: boolean;
  side?: boolean;
  disabled?: boolean;
  choose?: () => void;
}
