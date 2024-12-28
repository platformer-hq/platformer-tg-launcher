// /* @refresh reload */
// import { render } from 'solid-js/web';
// import { retrieveLaunchParams, serializeLaunchParams } from '@telegram-apps/sdk-solid';
//
// import { Root } from '@/components/Root/Root.js';
// import { init } from '@/init.js';
//
// import './index.scss';
// import './mockEnv.js';
//
// const lp = retrieveLaunchParams();
// const searchParams = new URLSearchParams(
//   // Telegram API has a bug replacing & with &amp; for some reason. We are replacing it back.
//   window.location.search.replace(/&amp;/g, '&'),
// );
//
// // Compute the base URL for API requests. It can either be a relative or absolute path.
// const baseUrl = new URL(
//   searchParams.get('api_base_url') || 'https://platformer.tg/api/gql',
//   window.location.origin,
// ).toString();
//
// init(lp.startParam === 'debug' || import.meta.env.DEV);
//
// render(() => (
//   <Root
//     appId={parseInt(searchParams.get('app_id') || '', 10)}
//     baseUrl={baseUrl}
//     platform={lp.platform}
//     fallbackUrl={searchParams.get('fallback_url')}
//     // TODO: We should use launch params raw representation. Otherwise, we may lose some
//     //  useful data.
//     launchParams={serializeLaunchParams(lp)}
//     // initData={lp.initDataRaw}
//     // initData={'query_id=AAHdF6IQAAAAAN0XohAX5dp8&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22added_to_attachment_menu%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&auth_date=1735297346&signature=lVTtitD03hVpp6AvCcaLM-bH6Bw5ZOM2aT4qTo6QtdZB7ioQ7_hCoKhwvEZRdJGAprBz0raD7g68LHp_EVFUAw&hash=aabee971ac21e782809630ff8d9f12d4f8deb26246fc6aa8d4b1ff82476b1c64'}
//   />
// ), document.getElementById('root')!);
//

import image from './sad@3x.png?process';

console.log(image);