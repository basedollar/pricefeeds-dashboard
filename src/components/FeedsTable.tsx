"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { feeds } from "@/addresses";
import ABI from "@/abis/GuardedLiquityV2OracleAdaptor";

interface FeedData {
  feedname: string;
  address: string;
  note?: string;
  decimals?: number;
  latestRoundData?: {
    roundId: bigint;
    answer: bigint;
    startedAt: bigint;
    updatedAt: bigint;
    answeredInRound: bigint;
  };
  name?: string;
  paused?: boolean;
  error?: string;
}

export function FeedsTable() {
  const [data, setData] = useState<FeedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = createPublicClient({
          chain: base,
          transport: http(),
        });

        // Build multicall contracts array
        const contracts = feeds.flatMap((feed) => [
          {
            address: feed.address as `0x${string}`,
            abi: ABI,
            functionName: "decimals",
          },
          {
            address: feed.address as `0x${string}`,
            abi: ABI,
            functionName: "latestRoundData",
          },
          {
            address: feed.address as `0x${string}`,
            abi: ABI,
            functionName: "name",
          },
          {
            address: feed.address as `0x${string}`,
            abi: ABI,
            functionName: "paused",
          },
        ]);

        const results = await client.multicall({
          contracts: contracts,
        });

        // Process results
        const feedData: FeedData[] = feeds.map((feed, index) => {
          const baseIndex = index * 4;
          const decimalsResult = results[baseIndex];
          const latestRoundDataResult = results[baseIndex + 1];
          const nameResult = results[baseIndex + 2];
          const pausedResult = results[baseIndex + 3];

          return {
            feedname: feed.feedname,
            address: feed.address,
            note: (feed as { note?: string }).note,
            decimals:
              decimalsResult.status === "success"
                ? decimalsResult.result as number
                : undefined,
            latestRoundData:
              latestRoundDataResult.status === "success"
                ? {
                    roundId: (latestRoundDataResult.result as [bigint, bigint, bigint, bigint, bigint])[0],
                    answer: (latestRoundDataResult.result as [bigint, bigint, bigint, bigint, bigint])[1],
                    startedAt: (latestRoundDataResult.result as [bigint, bigint, bigint, bigint, bigint])[2],
                    updatedAt: (latestRoundDataResult.result as [bigint, bigint, bigint, bigint, bigint])[3],
                    answeredInRound: (latestRoundDataResult.result as [bigint, bigint, bigint, bigint, bigint])[4],
                  }
                : undefined,
            name: nameResult.status === "success" ? nameResult.result as string : undefined,
            paused:
              pausedResult.status === "success" ? pausedResult.result as boolean : undefined,
            error:
              decimalsResult.status === "failure" ? decimalsResult.error?.message : undefined,
          };
        });

        setData(feedData);
      } catch (error) {
        console.error("Error fetching feeds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-zinc-600 dark:text-zinc-400">Loading feeds...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Feed Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Address
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Decimals
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Latest Price
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Updated At
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Paused
            </th>
            <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((feed, index) => (
            <tr
              key={feed.address}
              className={`border-b border-zinc-200 dark:border-zinc-800 ${
                index % 2 === 0
                  ? "bg-white dark:bg-black"
                  : "bg-zinc-50 dark:bg-zinc-950"
              } hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors`}
            >
              <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                {feed.feedname}
              </td>
              <td className="px-6 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {feed.address}
              </td>
              <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                {feed.name ? feed.name : "-"}
              </td>
              <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                {feed.decimals !== undefined ? feed.decimals : "-"}
              </td>
              <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                {feed.latestRoundData
                  ? (
                      Number(feed.latestRoundData.answer) /
                      Math.pow(10, feed.decimals || 8)
                    ).toFixed(feed.decimals || 8)
                  : "-"}
              </td>
              <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-400">
                {feed.latestRoundData?.updatedAt
                  ? new Date(
                      Number(feed.latestRoundData.updatedAt) * 1000
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    feed.paused
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {feed.paused ? "Paused" : "Active"}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-500 italic">
                {feed.note || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
