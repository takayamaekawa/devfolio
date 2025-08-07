import type { LocalizedString } from "../types/common";
import type { FullRouteInfo } from "../types/routes";

export type NavItem = {
  path: string;
  name: string;
  title: LocalizedString;
};

// ★ mainNavigationSequence は NavItem の配列を返す関数
export const generateNavigationSequence = (routesData: {
  routes: FullRouteInfo[];
}): NavItem[] => {
  return routesData.routes.map((route) => ({
    path: route.path,
    name: route.name,
    title: route.title,
  }));
};

// ★ getNextPage と getPreviousPage は routesData を引数に取り、内部でナビゲーションシーケンスを生成して使う
export function getNextPage(
  currentPath: string,
  routesData: { routes: FullRouteInfo[] },
): NavItem | null {
  const sequence = generateNavigationSequence(routesData); // ★ 関数を呼び出してシーケンスを取得
  const currentIndex = sequence.findIndex((item) => item.path === currentPath);
  if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
    return sequence[currentIndex + 1];
  }
  return null;
}

export function getPreviousPage(
  currentPath: string,
  routesData: { routes: FullRouteInfo[] },
): NavItem | null {
  const sequence = generateNavigationSequence(routesData); // ★ 関数を呼び出してシーケンスを取得
  const currentIndex = sequence.findIndex((item) => item.path === currentPath);
  if (currentIndex !== -1 && currentIndex > 0) {
    return sequence[currentIndex - 1];
  }
  return null;
}
