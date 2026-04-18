import { colors } from '../constants/colors';

export function getTriageMeta(triage) {
  switch (triage) {
    case 'red':
      return { label: 'Critical', color: colors.triageRed };
    case 'yellow':
      return { label: 'Urgent', color: colors.triageYellow };
    case 'green':
      return { label: 'Stable', color: colors.triageGreen };
    default:
      return { label: 'Unknown', color: colors.textMuted };
  }
}