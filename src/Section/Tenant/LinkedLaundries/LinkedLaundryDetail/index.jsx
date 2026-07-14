import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Clock,
    Cuboid,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Star,
    Activity,
    Box,
    Truck,
    RotateCcw
} from "lucide-react";
import Badge from "../../../../Components/UI/Badge";
import Button from "../../../../Components/UI/Button";
import Card from "../../../../Components/UI/Card";
import IconWrapper from "../../../../Components/UI/IconWrapper";
import Tabs from "../../../../Components/UI/Tabs";

import OverviewTab from "./Tabs/OverviewTab";
import DispatchBatchesTab from "./Tabs/DispatchBatchesTab";
import InventoryTab from "./Tabs/InventoryTab";
import ActivityLogTab from "./Tabs/ActivityLogTab";

import { laundryDetails } from "./data";

const LinkedLaundryDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");

    const tabOptions = [
        { label: "Overview", value: "overview" },
        { label: "Dispatch Batches", value: "dispatch", count: 6 },
        { label: "Inventory", value: "inventory", count: 8 },
        // { label: "Exceptions", value: "exceptions", count: 2 },
        { label: "Activity Log", value: "activity", count: 10 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">

                        <h1 className="m-0 text-2xl font-black text-(--theme-text-primary)">
                            {laundryDetails.name}
                        </h1>
                        <Badge size="md" variant={laundryDetails.statusVariant} className="ml-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {laundryDetails.status}
                        </Badge>
                        {laundryDetails.isDefault && (
                            <Badge size="md" variant="warning" leftIcon={<Star size={14} className="fill-current" />}>
                                Default Laundry
                            </Badge>
                        )}
                    </div>
                    <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-muted)">
                        View laundry relationship, dispatch activity, inventory, and exceptions.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card padding="16px" rounded="16px" className="flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <Box size={16} />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="m-0 text-3xl font-black text-blue-500">{laundryDetails.stats.activeBatches}</p>
                        <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">Active Batches</p>
                    </div>
                </Card>

                <Card padding="16px" rounded="16px" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                            <Truck size={16} />
                        </span>
                        <span className="text-xs font-bold text-green-500">{laundryDetails.stats.itemsSentTrend}</span>
                    </div>
                    <div className="mt-4">
                        <p className="m-0 text-3xl font-black text-yellow-500">{laundryDetails.stats.itemsSent}</p>
                        <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">Items Sent</p>
                    </div>
                </Card>

                <Card padding="16px" rounded="16px" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                            <RotateCcw size={16} />
                        </span>
                        <span className="text-xs font-bold text-green-500">{laundryDetails.stats.itemsReturnedTrend}</span>
                    </div>
                    <div className="mt-4">
                        <p className="m-0 text-3xl font-black text-green-500">{laundryDetails.stats.itemsReturned}</p>
                        <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">Items Returned</p>
                    </div>
                </Card>

                <Card padding="16px" rounded="16px" className="flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                            <RefreshCw size={16} />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="m-0 text-3xl font-black text-purple-500">{laundryDetails.stats.inLaundry}</p>
                        <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">In Laundry</p>
                    </div>
                </Card>

                <Card padding="16px" rounded="16px" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                            <Clock size={16} />
                        </span>
                        <span className="text-xs font-bold text-red-500">{laundryDetails.stats.delayedTrend}</span>
                    </div>
                    <div className="mt-4">
                        <p className="m-0 text-3xl font-black text-orange-500">{laundryDetails.stats.delayedItems}</p>
                        <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">Delayed Items</p>
                    </div>
                </Card>

                <Card padding="16px" rounded="16px" className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
                            <Activity size={16} />
                        </span>
                        <span className="text-xs font-bold text-green-500">{laundryDetails.stats.turnaroundTrend}</span>
                    </div>
                    <div className="mt-4">
                        <p className="m-0 text-3xl font-black text-blue-400">{laundryDetails.stats.avgTurnaround}</p>
                        <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">Avg. Turnaround</p>
                    </div>
                </Card>
            </section>

            {/* Main Content Card */}
            <Card rounded="20px" padding="0">
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <IconWrapper
                            icon={Building2}
                            iconSize={24}
                            sizeClassName="h-16 w-16"
                            roundedClassName="rounded-2xl"
                            variant="info"
                        />
                        <div>
                            <h2 className="m-0 text-xl font-black text-(--theme-text-primary)">
                                {laundryDetails.name}
                            </h2>
                            <p className="m-0 mt-1 text-xs font-bold text-(--theme-text-muted)">
                                {laundryDetails.id}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-(--theme-border) pt-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <Building2 size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Contact</p>
                                </div>
                                <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-primary)">
                                    {laundryDetails.contact.name}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <Mail size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Email</p>
                                </div>
                                <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-primary)">
                                    {laundryDetails.contact.email}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <Phone size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Phone</p>
                                </div>
                                <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-primary)">
                                    {laundryDetails.contact.phone}
                                </p>
                            </div>

                            <div className="row-span-2">
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <MapPin size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Address</p>
                                </div>
                                <p className="m-0 mt-2 max-w-[200px] text-sm font-semibold leading-relaxed text-(--theme-text-primary)">
                                    {laundryDetails.contact.address}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <Star size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Default</p>
                                </div>
                                <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-primary)">
                                    {laundryDetails.isDefault ? "Yes — Primary" : "No"}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <CalendarDays size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Linked Since</p>
                                </div>
                                <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-primary)">
                                    {laundryDetails.contact.linkedSince}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-(--theme-text-muted)">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--theme-surface-hover)">
                                        <Activity size={12} />
                                    </span>
                                    <p className="m-0 text-[10px] font-black uppercase tracking-wider">Status</p>
                                </div>
                                <p className="m-0 mt-2 text-sm font-semibold text-(--theme-text-primary)">
                                    {laundryDetails.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Region */}
                <div className="border-t border-(--theme-border)">
                    <div className="px-6 pt-4">
                        <Tabs
                            items={tabOptions}
                            onChange={setActiveTab}
                            value={activeTab}
                        />
                    </div>
                    <div className="bg-(--theme-surface-strong) p-6 rounded-b-[20px]">
                        {activeTab === "overview" && <OverviewTab />}
                        {activeTab === "dispatch" && <DispatchBatchesTab />}
                        {activeTab === "inventory" && <InventoryTab />}
                        {activeTab === "exceptions" && <div className="text-center text-(--theme-text-muted) py-8">Exceptions coming soon</div>}
                        {activeTab === "activity" && <ActivityLogTab />}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LinkedLaundryDetail;
