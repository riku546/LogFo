"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RoadmapListItem } from "../api/roadmapApi";
import { fetchRoadmapList } from "../api/roadmapApi";

/**
 * ロードマップ一覧の取得を管理するカスタムフック
 *
 * Usage:
 * const { roadmapList, isLoading } = useRoadmapList();
 */
export const useRoadmapList = () => {
  const router = useRouter();
  const [roadmapList, setRoadmapList] = useState<RoadmapListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoadmaps = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("ログインが必要です");
        router.push("/signin");
        return;
      }

      try {
        const roadmaps = await fetchRoadmapList(token);
        setRoadmapList(roadmaps);
      } catch (error) {
        console.error(error);
        toast.error("ロードマップの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadRoadmaps();
  }, [router]);

  return { roadmapList, isLoading };
};
