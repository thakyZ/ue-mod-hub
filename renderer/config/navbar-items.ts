/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

export declare type NavbarItem = {
    href: string;
    text: (typeof navbar_items)[number]['text'];
    desc: (typeof navbar_items)[number]['desc'];
    image: string;
};

/** @type {readonly NavbarItem[]} */
// text & desc use localization keys
const navbar_items = [
    {
        href: '/play',
        text: '/play.name',
        desc: '/play.desc',
        image: '/img/heap1.png',
    },
    {
        href: '/mods',
        text: '/mods.name',
        desc: '/mods.desc',
        image: '/img/heap2.png',
    },
    {
        href: '/servers',
        text: '/servers.name',
        desc: '/servers.desc',
        image: '/img/heap2.png',
    },
    {
        href: '/about',
        text: '/about.name',
        desc: '/about.tldr',
        image: '/img/heap2.png',
    },
    {
        href: '/logs',
        text: '/logs.name',
        desc: '/logs.desc',
        image: '/img/heap2.png',
    },
] as const;

export default navbar_items;
