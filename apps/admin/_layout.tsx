import { PageProps } from '@fathym/eac-applications/preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { AdminDashboardTemplate } from '@o-industrial/common/atomic/templates';
import { AdminNav } from '@o-industrial/common/atomic/molecules';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

type AdminLayoutData = {
  NavItems: { href: string; label: string }[];
  Username?: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenIndustrialWebState,
  AdminLayoutData
> = {
  GET: (_req, ctx) => {
    ctx.Data.NavItems = [
      { href: '/', label: 'Dashboard' },
      { href: '/users', label: 'Users' },
      { href: '/workspaces', label: 'Workspaces' },
      { href: '/licenses', label: 'Licenses' },
      { href: '/access-cards', label: 'Access Cards' },
      { href: '/access-rights', label: 'Access Rights' },
    ];

    ctx.Data.Username = ctx.State.Username;

    return ctx.Next();
  },
};

export default function DashboardLayout({
  Data: { NavItems, Username },
  Component,
  Revision,
}: PageProps<AdminLayoutData>) {
  return (
    <html class='h-full'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />

        <title>Fathym EaC Runtime</title>

        <link
          rel='shortcut icon'
          type='image/png'
          href='/assets/favicon.ico'
        />

        <link
          rel='stylesheet'
          href={`/tailwind/styles.css?Revision=${Revision}`}
        />

        <link
          rel='stylesheet'
          href='https://unpkg.com/reactflow@11.11.4/dist/style.css'
        />
      </head>

      <body class='h-full bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50'>
        <div class='relative w-screen h-screen max-w-full flex flex-col overflow-hidden'>
          <AdminDashboardTemplate
            appBar={
              <div class='-:-:sticky -:-:top-0 -:-:z-50 -:-:p-4 -:-:border-b -:-:border-slate-700 -:-:bg-slate-900/95 -:-:backdrop-blur -:-:text-lg -:-:font-semibold'>
                Admin
                <span class='-:-:ml-2 -:-:text-xs -:-:text-slate-400 -:-:font-normal'>
                  {Username ? `• ${Username}` : ''}
                </span>
              </div>
            }
            nav={<AdminNav items={NavItems} title='Navigation' />}
          >
            <Component />
          </AdminDashboardTemplate>
        </div>
      </body>
    </html>
  );
}
