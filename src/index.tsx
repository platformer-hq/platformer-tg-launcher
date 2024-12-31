/* @refresh reload */
import { render } from 'solid-js/web';
import { retrieveLaunchParams } from '@telegram-apps/sdk-solid';

import { init } from '@/init.js';
import { Root } from '@/components/Root/Root.js';

import './index.scss';
import './mockEnv.js';

const { startParam } = retrieveLaunchParams();
init(startParam && startParam.includes('platformer_debug') || import.meta.env.DEV);

render(() => <Root/>, document.getElementById('root')!);
