import { Request } from "express";
import { ulid } from "ulid";
import { faker } from "@faker-js/faker/locale/it";
import ServicesDB from "../../../persistence/services";
import { HistoryPieceOfData } from "../types/history";
import { FIMSConfig } from "../types/config";

export const generateHistory = (config: FIMSConfig) => {
  const services = ServicesDB.getAllServices();
  if (services.length === 0) {
    throw new Error("FIMS cannot work without any configured service");
  }

  const relyingPartyNameForService = new Map<string, string>();

  const historyConfig = config.history;
  return [...Array(historyConfig.count).keys()].map(valueIndex => {
    const serviceId =
      services[Math.round(Math.random() * (services.length - 1))].service_id;
    if (!relyingPartyNameForService.has(serviceId)) {
      relyingPartyNameForService.set(serviceId, faker.company.name());
    }
    const displayName = relyingPartyNameForService.get(serviceId) ?? "";

    const timestamp = new Date();
    timestamp.setMonth(timestamp.getMonth() - valueIndex);
    return {
      id: ulid(),
      service_id: serviceId,
      redirect: {
        display_name: displayName
      },
      timestamp: timestamp.toISOString()
    };
  });
};

export const nextPageFromRequest = (
  config: FIMSConfig,
  history: HistoryPieceOfData[] | null,
  req: Request
) => {
  if (!history) {
    return "History not initialized";
  }

  const pageSize = config.history.pageSize;

  const continuationToken = req.query.continuationToken;
  if (continuationToken) {
    const firstItemIndex = history.findIndex(
      pieceOfData => pieceOfData.id === continuationToken
    );
    if (firstItemIndex < 0) {
      return `No match for given continuation token (${continuationToken})`;
    }
    const lastItemIndex = Math.min(firstItemIndex + pageSize, history.length);
    return {
      items: history.slice(firstItemIndex, lastItemIndex),
      continuationToken:
        lastItemIndex < history.length ? history[lastItemIndex].id : undefined
    };
  }

  const lastItemIndex = Math.min(pageSize, history.length);
  return {
    items: history.slice(0, lastItemIndex),
    continuationToken:
      lastItemIndex < history.length ? history[lastItemIndex].id : undefined
  };
};

export const isProcessingExport = (
  config: FIMSConfig,
  lastExportRequestTimestamp: number
) =>
  Date.now() - lastExportRequestTimestamp <
  config.history.exportProcessingTimeMilliseconds;
