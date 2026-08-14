-- 雅祺事业工作台 · 云端同步表
-- 用法：登录 Supabase 控制台 → 左侧 SQL Editor → 粘贴本文件全部内容 → Run
-- 对应工作台「☁ 同步」面板里的默认表名 yaqi_workbench

create table if not exists yaqi_workbench (
  id          text primary key,
  state       text not null,
  updated_at  timestamptz default now()
);

-- 开启行级安全（RLS）
alter table yaqi_workbench enable row level security;

-- 允许匿名(anon)角色读写这一张表
-- 说明：前端使用的 anon key 是公开密钥，因此任何拿到「项目 URL + anon key」的人都能读写本表。
-- 适合「单人自用 / 信任的小团队共享同一份数据」的场景。
-- 若未来需要区分成员权限，请改用 Supabase Auth 登录 + 针对性 RLS 策略。
drop policy if exists "anon_all_yaqi_workbench" on yaqi_workbench;
create policy "anon_all_yaqi_workbench"
  on yaqi_workbench
  for all
  to anon
  using (true)
  with check (true);
