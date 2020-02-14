/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter } from "events";
import {
    IComponentLoadable,
    IComponentRouter,
    IRequest,
    IResponse,
    IComponentHTMLOptions,
    IComponentHTMLVisual,
    IComponentHandle,
    IComponentHTMLView,
} from "@microsoft/fluid-component-core-interfaces";
import { ComponentRuntime } from "@microsoft/fluid-component-runtime";
import { ISharedMap, SharedMap } from "@microsoft/fluid-map";
import {
    IMergeTreeInsertMsg,
    ReferenceType,
    reservedRangeLabelsKey,
    MergeTreeDeltaType,
    createMap,
} from "@microsoft/fluid-merge-tree";
import { IComponentContext, IComponentFactory, IComponentRuntime } from "@microsoft/fluid-runtime-definitions";
import { SharedString } from "@microsoft/fluid-sequence";
import { ISharedObjectFactory } from "@microsoft/fluid-shared-object-base";
import { EditorView } from "prosemirror-view";
import { nodeTypeKey } from "./fluidBridge";
import { FluidCollabManager, IProvideRichTextEditor } from "./fluidCollabManager";

function createTreeMarkerOps(
    treeRangeLabel: string,
    beginMarkerPos: number,
    endMarkerPos: number,
    nodeType: string,
): IMergeTreeInsertMsg[] {

    const endMarkerProps = createMap<any>();
    endMarkerProps[reservedRangeLabelsKey] = [treeRangeLabel];
    endMarkerProps[nodeTypeKey] = nodeType;

    const beginMarkerProps = createMap<any>();
    beginMarkerProps[reservedRangeLabelsKey] = [treeRangeLabel];
    beginMarkerProps[nodeTypeKey] = nodeType;

    return [
        {
            seg: { marker: { refType: ReferenceType.NestBegin }, props: beginMarkerProps },
            pos1: beginMarkerPos,
            type: MergeTreeDeltaType.INSERT,
        },
        {
            seg: { marker: { refType: ReferenceType.NestEnd }, props: endMarkerProps },
            pos1: endMarkerPos,
            type: MergeTreeDeltaType.INSERT,
        },
    ];
}

class ProseMirrorView implements IComponentHTMLView {
    private content: HTMLDivElement;
    private readonly editorView: EditorView;
    private textArea: HTMLDivElement;
    private readonly collabManager: FluidCollabManager;

    public get IComponentHTMLView() { return this; }

    public constructor(
        private readonly text: SharedString,
        private readonly runtime: IComponentRuntime,
    ) {
        this.collabManager = new FluidCollabManager(this.text, this.runtime.loader);
    }

    public render(elm: HTMLElement, options?: IComponentHTMLOptions): void {
        // Create base textarea
        if (!this.textArea) {
            this.textArea = document.createElement("div");
            this.textArea.classList.add("editor");
            this.content = document.createElement("div");
            this.content.style.display = "none";
            this.content.innerHTML = "";
        }

        // Reparent if needed
        if (this.textArea.parentElement !== elm) {
            this.textArea.remove();
            this.content.remove();
            elm.appendChild(this.textArea);
            elm.appendChild(this.content);
        }

        if (!this.editorView) {
            this.collabManager.setupEditor(this.textArea);
        }
    }

    public remove() {
        // Maybe implement this some time.
    }
}

export class ProseMirror extends EventEmitter
    implements IComponentLoadable, IComponentRouter, IComponentHTMLVisual, IProvideRichTextEditor {
    public static async load(runtime: IComponentRuntime, context: IComponentContext) {
        const collection = new ProseMirror(runtime, context);
        await collection.initialize();

        return collection;
    }

    public get IComponentLoadable() { return this; }
    public get IComponentRouter() { return this; }
    public get IComponentHTMLVisual() { return this; }
    public get IRichTextEditor() { return this.collabManager; }

    public url: string;
    public text: SharedString;
    private root: ISharedMap;
    private collabManager: FluidCollabManager;

    constructor(
        private readonly runtime: IComponentRuntime,
        /* Private */ context: IComponentContext,
    ) {
        super();

        this.url = context.id;
    }

    public async request(request: IRequest): Promise<IResponse> {
        return {
            mimeType: "fluid/component",
            status: 200,
            value: this,
        };
    }

    private async initialize() {
        if (!this.runtime.existing) {
            this.root = SharedMap.create(this.runtime, "root");
            const text = SharedString.create(this.runtime);

            const ops = createTreeMarkerOps("prosemirror", 0, 1, "paragraph");
            text.groupOperation({ ops, type: MergeTreeDeltaType.GROUP });
            text.insertText(1, "Hello, world!");

            this.root.set("text", text.handle);
            this.root.register();
        }

        this.root = await this.runtime.getChannel("root") as ISharedMap;
        this.text = await this.root.get<IComponentHandle>("text").get<SharedString>();

        this.collabManager = new FluidCollabManager(this.text, this.runtime.loader);

        // Access for debugging
        // eslint-disable-next-line dot-notation
        window["easyComponent"] = this;
    }

    public addView(): IComponentHTMLView {
        return new ProseMirrorView(this.text, this.runtime);
    }
}

class ProseMirrorFactory implements IComponentFactory {
    public get IComponentFactory() { return this; }

    public instantiateComponent(context: IComponentContext): void {
        const dataTypes = new Map<string, ISharedObjectFactory>();
        const mapFactory = SharedMap.getFactory();
        const sequenceFactory = SharedString.getFactory();

        dataTypes.set(mapFactory.type, mapFactory);
        dataTypes.set(sequenceFactory.type, sequenceFactory);

        ComponentRuntime.load(
            context,
            dataTypes,
            (runtime) => {
                const proseMirrorP = ProseMirror.load(runtime, context);
                runtime.registerRequestHandler(async (request: IRequest) => {
                    const proseMirror = await proseMirrorP;
                    return proseMirror.request(request);
                });
            });
    }
}

export const fluidExport = new ProseMirrorFactory();
