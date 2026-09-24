import type { ComponentProps } from "react";
import {
  DocContent,
  HomeLayout as OriginalHomeLayout,
} from "@rspress/core/theme-original";

type OriginalHomeLayoutProps = ComponentProps<typeof OriginalHomeLayout>;

// rsbuild 构建期注入的环境变量（docs 工程未引入 vite/client 等环境类型，此处补充声明）
declare global {
  interface ImportMetaEnv {
    readonly SSG_MD?: boolean;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * 首页布局：原版 HomeLayout 只渲染 hero + features + footer，不渲染页面 MDX 正文；
 * 本工程首页要在 features 下方承载快速体验预览、安装命令与项目故事，
 * 故将 DocContent 挂到 afterFeatures 插槽。llms（SSG_MD）输出同理追加正文 markdown。
 */
function HomeLayout({ afterFeatures, ...rest }: OriginalHomeLayoutProps) {
  // DocContent 的 components 为必填键（类型上允许 undefined）：上游 homeProps 不传该值，
  // 与原版行为一致，显式传 undefined
  if (import.meta.env.SSG_MD) {
    return (
      <>
        <OriginalHomeLayout {...rest} afterFeatures={afterFeatures} />
        <DocContent components={undefined} />
      </>
    );
  }
  return (
    <OriginalHomeLayout
      {...rest}
      afterFeatures={
        <>
          {afterFeatures}
          <div className="rp-doc rspress-doc home-doc">
            <DocContent components={undefined} />
          </div>
        </>
      }
    />
  );
}

export { HomeLayout };
