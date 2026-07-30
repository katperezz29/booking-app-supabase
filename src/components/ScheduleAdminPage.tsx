import React from 'react';
import { AdministratorPage } from './AdministratorPage';
import { Page } from '../types';

interface ScheduleAdminPageProps {
  onNavigate: (page: Page) => void;
  onOpenSupabaseModal: () => void;
}

export const ScheduleAdminPage: React.FC<ScheduleAdminPageProps> = (props) => {
  return <AdministratorPage {...props} />;
};

