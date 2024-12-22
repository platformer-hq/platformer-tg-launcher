/* @refresh reload */
import { render } from 'solid-js/web';
import { retrieveLaunchParams } from '@telegram-apps/sdk-solid';

import { Root } from '@/components/Root.js';
import { init } from '@/init.js';

import './index.scss';
import './mockEnv.js';

init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

render(() => <Root/>, document.getElementById('root')!);

