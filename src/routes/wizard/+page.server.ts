import type { PageServerLoad } from './$types';
import { getWizardRequests } from '#lib/wizard';
import { getAllArticles } from '#lib/server/content';

export const load: PageServerLoad = () => {
  const requests = getWizardRequests(getAllArticles());

  return { requests };
};
