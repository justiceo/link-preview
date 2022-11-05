import {
    Component, ElementRef, OnDestroy, Input, Output, EventEmitter, Renderer2,
    ContentChildren, QueryList, ViewChild, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, AfterContentInit, TemplateRef, ContentChild, OnInit
} from '@angular/core';
import { trigger, style, transition, animate, AnimationEvent, animation, useAnimation } from '@angular/animations';
import { DomHandler } from 'primeng/dom';
import { Footer, PrimeTemplate, PrimeNGConfig } from 'primeng/api';
import { UniqueComponentId, ZIndexUtils } from 'primeng/utils';

const showAnimation = animation([
    style({ transform: '{{transform}}', opacity: 0 }),
    animate('{{transition}}')
]);

const hideAnimation = animation([
    animate('{{transition}}', style({ transform: '{{transform}}', opacity: 0 }))
]);


type ResizeDirection = 'sw' | 'se';

@Component({
    selector: 'sp-preview',
    styleUrls: ['preview.component.scss'],
    templateUrl: "./preview.component.html",
    animations: [
        trigger('animation', [
            transition('void => visible', [
                useAnimation(showAnimation)
            ]),
            transition('visible => void', [
                useAnimation(hideAnimation)
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'p-element'
    }
})
export class PreviewComponent implements AfterContentInit, OnInit, OnDestroy {

    @Input() headerText: string = "";

    @Input() headerIconUrl: string = "";

    @Input() draggable: boolean = true;

    @Input() resizable: boolean = true;
    resizeDirection: ResizeDirection = 'sw';

    @Input() contentStyle: any;

    @Input() contentStyleClass: string = "";

    @Input() closeOnEscape: boolean = true;

    @Input() rtl: boolean = false;

    @Input() closable: boolean = true;

    @Input() appendTo: any;

    @Input() breakpoints: any;

    @Input() styleClass: string = "";

    @Input() showHeader: boolean = true;

    @Input() blockScroll: boolean = false;

    @Input() autoZIndex: boolean = true;

    @Input() baseZIndex: number = 0;

    @Input() minX: number = 0;

    @Input() minY: number = 0;

    @Input() focusOnShow: boolean = true;

    @Input() keepInViewport: boolean = true;

    @Input() focusTrap: boolean = true;

    @Input() transitionOptions: string = '150ms cubic-bezier(0, 0, 0.2, 1)';

    newTabIcon: string = "pi pi-arrow-up-right";

    @Input() closeIcon: string = 'pi pi-times';

    @Input() closeAriaLabel: string = "";

    @Input() closeTabindex: string = "-1";

    @ContentChild(Footer) footerFacet!: QueryList<Footer>;

    @ContentChildren(PrimeTemplate) templates!: QueryList<any>;

    @ViewChild('titlebar') headerViewChild!: ElementRef;

    @ViewChild('content') contentViewChild!: ElementRef;

    @ViewChild('footer') footerViewChild!: ElementRef;

    @Output() onShow: EventEmitter<any> = new EventEmitter();

    @Output() onHide: EventEmitter<any> = new EventEmitter();

    @Output() visibleChange: EventEmitter<any> = new EventEmitter();

    @Output() onResizeInit: EventEmitter<any> = new EventEmitter();

    @Output() onResizeEnd: EventEmitter<any> = new EventEmitter();

    @Output() onDragEnd: EventEmitter<any> = new EventEmitter();

    @Output() onOpenInNewTab: EventEmitter<any> = new EventEmitter();

    contentTemplate!: TemplateRef<any>;

    footerTemplate!: TemplateRef<any>;

    _visible!: boolean;

    container!: HTMLDivElement;

    wrapper!: HTMLElement;

    dragging: boolean = false;

    documentDragListener: any;

    documentDragEndListener: any;

    resizing: boolean = false;

    documentResizeListener: any;

    documentResizeEndListener: any;

    documentEscapeListener?: Function;

    lastPageX: number = 0;

    lastPageY: number = 0;

    id: string = UniqueComponentId();

    _style: any = {};

    _position: string = "center";

    originalStyle: any;

    transformOptions: any = "scale(0.7)";

    styleElement: any;

    constructor(public el: ElementRef, public renderer: Renderer2, public zone: NgZone, private cd: ChangeDetectorRef, public config: PrimeNGConfig) {

    }

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    break;

                case 'content':
                    this.contentTemplate = item.template;
                    break;

                case 'footer':
                    this.footerTemplate = item.template;
                    break;

                default:
                    this.contentTemplate = item.template;
                    break;
            }
        });
    }

    ngOnInit() {
        if (this.breakpoints) {
            this.createStyle();
        }
    }

    @Input() get visible(): any {
        return this._visible;
    }
    set visible(value: any) {
        this._visible = value;
    }

    @Input() get style(): any {
        return this._style;
    }
    set style(value: any) {
        if (value) {
            this._style = { ...value };
            this.originalStyle = value;
        }
    }

    @Input() get position(): string {
        return this._position;
    };

    set position(value: string) {
        this._position = value;

        switch (value) {
            case 'topleft':
            case 'bottomleft':
            case 'left':
                this.transformOptions = "translate3d(-100%, 0px, 0px)";
                break;
            case 'topright':
            case 'bottomright':
            case 'right':
                this.transformOptions = "translate3d(100%, 0px, 0px)";
                break;
            case 'bottom':
                this.transformOptions = "translate3d(0px, 100%, 0px)";
                break;
            case 'top':
                this.transformOptions = "translate3d(0px, -100%, 0px)";
                break;
            default:
                this.transformOptions = "scale(0.7)";
                break;
        }
    }

    focus() {
        let focusable = DomHandler.findSingle(this.container, '[autofocus]');
        if (focusable) {
            this.zone.runOutsideAngular(() => {
                setTimeout(() => focusable.focus(), 5);
            });
        }
    }

    close(event: Event) {
        this.visibleChange.emit(false);
        event.preventDefault();
    }

    openInNewTab() {
        this.onOpenInNewTab.emit("new_tab_click");
    }

    moveOnTop() {
        if (this.autoZIndex) {
            ZIndexUtils.set('modal', this.container, this.baseZIndex + this.config.zIndex.modal);
            this.wrapper.style.zIndex = String(parseInt(this.container.style.zIndex, 10) - 1);
        }
    }

    createStyle() {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.type = 'text/css';
            document.head.appendChild(this.styleElement);
            let innerHTML = '';
            for (let breakpoint in this.breakpoints) {
                innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-dialog[${this.id}] {
                            width: ${this.breakpoints[breakpoint]} !important;
                        }
                    }
                `
            }

            this.styleElement.innerHTML = innerHTML;
        }
    }

    initDrag(event: MouseEvent) {
        if (DomHandler.hasClass(event.target, 'p-dialog-header-icon') || DomHandler.hasClass((<HTMLElement>event.target).parentElement, 'p-dialog-header-icon')) {
            return;
        }

        if (this.draggable) {
            this.dragging = true;
            this.lastPageX = event.pageX;
            this.lastPageY = event.pageY;

            if (this.container.style.margin !== '0px') {
                this.container.style.top = '12px';
            }
            this.container.style.margin = '0';
            DomHandler.addClass(document.body, 'p-unselectable-text');
        }
    }

    onKeydown(event: KeyboardEvent) {
        if (this.focusTrap) {
            if (event.which === 9) {
                event.preventDefault();

                let focusableElements = DomHandler.getFocusableElements(this.container);

                if (focusableElements && focusableElements.length > 0) {
                    if (!focusableElements[0].ownerDocument.activeElement) {
                        focusableElements[0].focus();
                    }
                    else {
                        let focusedIndex = focusableElements.indexOf(focusableElements[0].ownerDocument.activeElement);

                        if (event.shiftKey) {
                            if (focusedIndex == -1 || focusedIndex === 0)
                                focusableElements[focusableElements.length - 1].focus();
                            else
                                focusableElements[focusedIndex - 1].focus();
                        }
                        else {
                            if (focusedIndex == -1 || focusedIndex === (focusableElements.length - 1))
                                focusableElements[0].focus();
                            else
                                focusableElements[focusedIndex + 1].focus();
                        }
                    }
                }
            }
        }
    }

    onDrag(event: MouseEvent) {
        if (this.dragging) {
            let containerWidth = DomHandler.getOuterWidth(this.container);
            let containerHeight = DomHandler.getOuterHeight(this.container);
            let deltaX = event.pageX - this.lastPageX;
            let deltaY = event.pageY - this.lastPageY;
            let offset = this.container.getBoundingClientRect();
            let leftPos = offset.left + deltaX;
            let topPos = offset.top + deltaY;
            let viewport = DomHandler.getViewport();

            this.container.style.position = 'fixed';

            if (this.keepInViewport) {
                if (leftPos >= this.minX && (leftPos + containerWidth) < viewport.width) {
                    this._style.left = leftPos + 'px';
                    this.lastPageX = event.pageX;
                    this.container.style.left = leftPos + 'px';
                }

                if (topPos >= this.minY && (topPos + containerHeight) < viewport.height) {
                    this._style.top = topPos + 'px';
                    this.lastPageY = event.pageY;
                    this.container.style.top = topPos + 'px';
                }
            }
            else {
                this.lastPageX = event.pageX;
                this.container.style.left = leftPos + 'px';
                this.lastPageY = event.pageY;
                this.container.style.top = topPos + 'px';
            }
        }
    }

    endDrag(event: MouseEvent) {
        if (this.dragging) {
            this.dragging = false;
            DomHandler.removeClass(document.body, 'p-unselectable-text');
            this.cd.detectChanges();
            this.onDragEnd.emit(event);
        }
    }

    resetPosition() {
        this.container.style.position = '';
        this.container.style.left = '';
        this.container.style.top = '';
        this.container.style.margin = '';
    }

    //backward compatibility
    center() {
        this.resetPosition();
    }

    initResize(event: MouseEvent, direction: ResizeDirection) {
        if (this.resizable) {
            this.resizing = true;
            this.resizeDirection = direction;
            this.lastPageX = event.pageX;
            this.lastPageY = event.pageY;
            DomHandler.addClass(document.body, 'p-unselectable-text');
            this.onResizeInit.emit(event);
        }
    }

    onResize(event: MouseEvent) {
        if (!this.resizing) {
            return;
        }

        // Get existing dimensions.
        let offset = this.container.getBoundingClientRect();
        let minWidth = this.container.style.minWidth;
        let minHeight = this.container.style.minHeight;
        let viewport = DomHandler.getViewport();

        // TODO: Handle sw direction.

        // Compute new dimensions.
        let newWidth = event.pageX - offset.x;
        let newHeight = event.pageY - offset.y;

        // Check that newWidth is greater than minWidth and doesn't shoot off viewport.
        if ((!minWidth || newWidth > parseInt(minWidth)) && (offset.left + newWidth) < viewport.width) {
            this._style.width = newWidth + 'px';
            this.container.style.width = this._style.width;
        }

        // Do the same for height.
        if ((!minHeight || newHeight > parseInt(minHeight)) && (offset.top + newHeight) < viewport.height) {
            this._style.height = newHeight + 'px';
            this.container.style.height = this._style.height;
        }

    }

    resizeEnd(event: any) {
        if (this.resizing) {
            this.zone.run(() => {
                this.resizing = false;
                DomHandler.removeClass(document.body, 'p-unselectable-text');
                this.onResizeEnd.emit(event);
            })
        }
    }

    bindGlobalListeners() {
        if (this.draggable) {
            this.bindDocumentDragListener();
            this.bindDocumentDragEndListener();
        }

        if (this.resizable) {
            this.bindDocumentResizeListeners();
        }

        if (this.closeOnEscape && this.closable) {
            this.bindDocumentEscapeListener();
        }
    }

    unbindGlobalListeners() {
        this.unbindDocumentDragListener();
        this.unbindDocumentDragEndListener();
        this.unbindDocumentResizeListeners();
        this.unbindDocumentEscapeListener();
    }

    bindDocumentDragListener() {
        this.zone.runOutsideAngular(() => {
            this.documentDragListener = this.onDrag.bind(this);
            window.document.addEventListener('mousemove', this.documentDragListener);
        });
    }

    unbindDocumentDragListener() {
        if (this.documentDragListener) {
            window.document.removeEventListener('mousemove', this.documentDragListener);
            this.documentDragListener = null;
        }
    }

    bindDocumentDragEndListener() {
        this.zone.runOutsideAngular(() => {
            this.documentDragEndListener = this.endDrag.bind(this);
            window.document.addEventListener('mouseup', this.documentDragEndListener);
        });
    }

    unbindDocumentDragEndListener() {
        if (this.documentDragEndListener) {
            window.document.removeEventListener('mouseup', this.documentDragEndListener);
            this.documentDragEndListener = null;
        }
    }

    bindDocumentResizeListeners() {
        this.zone.runOutsideAngular(() => {
            this.documentResizeListener = this.onResize.bind(this);
            this.documentResizeEndListener = this.resizeEnd.bind(this);
            window.document.addEventListener('mousemove', this.documentResizeListener);
            window.document.addEventListener('mouseup', this.documentResizeEndListener);
        });
    }

    unbindDocumentResizeListeners() {
        if (this.documentResizeListener && this.documentResizeEndListener) {
            window.document.removeEventListener('mousemove', this.documentResizeListener);
            window.document.removeEventListener('mouseup', this.documentResizeEndListener);
            this.documentResizeListener = null;
            this.documentResizeEndListener = null;
        }
    }

    bindDocumentEscapeListener() {
        const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : 'document';

        this.documentEscapeListener = this.renderer.listen(documentTarget, 'keydown', (event) => {
            if (event.which == 27) {
                this.close(event);
            }
        });
    }

    unbindDocumentEscapeListener() {
        if (this.documentEscapeListener) {
            this.documentEscapeListener();
            this.documentEscapeListener = undefined;
        }
    }

    appendContainer() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.wrapper);
            else
                DomHandler.appendChild(this.wrapper, this.appendTo);
        }
    }

    restoreAppend() {
        if (this.container && this.appendTo) {
            this.el.nativeElement.appendChild(this.wrapper);
        }
    }

    onAnimationStart(event: AnimationEvent) {
        switch (event.toState) {
            case 'visible':
                this.container = event.element;
                this.wrapper = event.element.parentElement;
                this.appendContainer();
                this.moveOnTop();
                this.bindGlobalListeners();
                this.container.setAttribute(this.id, '');



                if (this.blockScroll) {
                    DomHandler.addClass(document.body, 'p-overflow-hidden');
                }

                if (this.focusOnShow) {
                    this.focus();
                }
                break;

            case 'void':
                break;
        }
    }

    onAnimationEnd(event: AnimationEvent) {
        switch (event.toState) {
            case 'void':
                this.onContainerDestroy();
                this.onHide.emit({});
                break;
            case 'visible':
                this.onShow.emit({});
                break;
        }
    }

    onContainerDestroy() {
        this.unbindGlobalListeners();
        this.dragging = false;

        if (this.blockScroll) {
            DomHandler.removeClass(document.body, 'p-overflow-hidden');
        }

        if (this.container && this.autoZIndex) {
            ZIndexUtils.clear(this.container);
        }

        this.container = null as unknown as HTMLDivElement;
        this.wrapper = null as unknown as HTMLElement;

        this._style = this.originalStyle ? { ...this.originalStyle } : {};
    }

    destroyStyle() {
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
    }

    ngOnDestroy() {
        if (this.container) {
            this.restoreAppend();
            this.onContainerDestroy();
        }

        this.destroyStyle();
    }

}