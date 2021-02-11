
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.31.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.31.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var ColorScheme;
    (function (ColorScheme) {
        ColorScheme["blue"] = "#5CBAEB";
        ColorScheme["orange"] = "#FF9750";
        ColorScheme["yellow"] = "#FFE86B";
        ColorScheme["green"] = "#8CEAA6";
        ColorScheme["pink"] = "#F2A8C6";
        ColorScheme["lightGrey"] = "#9C9FA0";
        ColorScheme["darkGrey"] = "#3D3D3D";
    })(ColorScheme || (ColorScheme = {}));

    /* src/background/shapes/Circle.svelte generated by Svelte v3.31.0 */
    const file = "src/background/shapes/Circle.svelte";

    function create_fragment$2(ctx) {
    	let g;
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*width*/ ctx[1] / 2);
    			attr_dev(circle, "cy", circle_cy_value = /*width*/ ctx[1] / 2);
    			attr_dev(circle, "r", circle_r_value = /*width*/ ctx[1] / 2);
    			attr_dev(circle, "fill", /*fill*/ ctx[0]);
    			add_location(circle, file, 11, 2, 291);
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[2] + "," + /*yPos*/ ctx[3] + ") rotate(" + /*rotation*/ ctx[4] + ")");
    			add_location(g, file, 10, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 2 && circle_cx_value !== (circle_cx_value = /*width*/ ctx[1] / 2)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*width*/ 2 && circle_cy_value !== (circle_cy_value = /*width*/ ctx[1] / 2)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*width*/ 2 && circle_r_value !== (circle_r_value = /*width*/ ctx[1] / 2)) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(circle, "fill", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*xPos, yPos, rotation*/ 28 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[2] + "," + /*yPos*/ ctx[3] + ") rotate(" + /*rotation*/ ctx[4] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Circle", slots, []);
    	let { fill = ColorScheme.blue } = $$props;
    	let { width = 9 } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = 0 } = $$props;
    	const writable_props = ["fill", "width", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Circle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("xPos" in $$props) $$invalidate(2, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(3, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(4, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({
    		ColorScheme,
    		fill,
    		width,
    		xPos,
    		yPos,
    		rotation
    	});

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("xPos" in $$props) $$invalidate(2, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(3, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(4, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, width, xPos, yPos, rotation];
    }

    class Circle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, not_equal, {
    			fill: 0,
    			width: 1,
    			xPos: 2,
    			yPos: 3,
    			rotation: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Circle",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get fill() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/Cross.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/background/shapes/Cross.svelte";

    // (14:2) {:else}
    function create_else_block$1(ctx) {
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M16.6419 13.0178H2.50028C1.12013 13.0178 0 11.8978 0 10.5178C0 9.13782 1.12013 8.01782 2.50028 8.01782H16.6419C18.022 8.01782 19.1421 9.13782 19.1421 10.5178C19.1421 11.8978 18.022 13.0178 16.6419 13.0178Z");
    			attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			add_location(path0, file$1, 14, 4, 947);
    			attr_dev(path1, "d", "M9.57031 20.086C8.19031 20.086 7.07031 18.9661 7.07031 17.5863V3.44763C7.07031 2.06777 8.19031 0.947876 9.57031 0.947876C10.9503 0.947876 12.0703 2.06777 12.0703 3.44763V17.5863C12.0703 18.9661 10.9503 20.086 9.57031 20.086Z");
    			attr_dev(path1, "fill", /*fill*/ ctx[0]);
    			add_location(path1, file$1, 15, 4, 1182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(path1, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(14:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if rotation == '0'}
    function create_if_block$1(ctx) {
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M2.49942 15.0791C1.85935 15.0791 1.21928 14.8392 0.729223 14.3492C-0.250887 13.3693 -0.250887 11.7895 0.729223 10.8095L10.7303 0.810492C11.7105 -0.169415 13.2906 -0.169415 14.2707 0.810492C15.2509 1.7904 15.2509 3.37024 14.2707 4.35015L4.26962 14.3492C3.77957 14.8392 3.13949 15.0791 2.49942 15.0791Z");
    			attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			add_location(path0, file$1, 11, 3, 277);
    			attr_dev(path1, "d", "M12.5005 15.0791C11.8605 15.0791 11.2204 14.8392 10.7303 14.3492L0.729223 4.35015C-0.250887 3.37024 -0.250887 1.7904 0.729223 0.810492C1.70933 -0.169415 3.28951 -0.169415 4.26962 0.810492L14.2707 10.8095C15.2509 11.7895 15.2509 13.3693 14.2707 14.3492C13.7807 14.8392 13.1406 15.0791 12.5005 15.0791Z");
    			attr_dev(path1, "fill", /*fill*/ ctx[0]);
    			add_location(path1, file$1, 12, 4, 607);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(path1, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:2) {#if rotation == '0'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*rotation*/ ctx[3] == "0") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if_block.c();
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$1, 9, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cross", slots, []);
    	let { fill = ColorScheme.blue } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = "0" } = $$props;
    	const writable_props = ["fill", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cross> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos, rotation });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos, rotation];
    }

    class Cross extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, not_equal, { fill: 0, xPos: 1, yPos: 2, rotation: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cross",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get fill() {
    		throw new Error("<Cross>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Cross>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<Cross>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<Cross>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<Cross>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<Cross>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Cross>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Cross>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/CircleWithHole.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/background/shapes/CircleWithHole.svelte";

    function create_fragment$4(ctx) {
    	let g;
    	let path;
    	let g_transform_value;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M16.6815 33.5346C7.58052 33.5346 0.179688 26.1353 0.179688 17.0361C0.179688 7.93701 7.58052 0.53772 16.6815 0.53772C25.7826 0.53772 33.1834 7.93701 33.1834 17.0361C33.1834 26.1353 25.7726 33.5346 16.6815 33.5346ZM16.6815 6.53715C10.8909 6.53715 6.18036 11.2467 6.18036 17.0361C6.18036 22.8256 10.8909 27.5351 16.6815 27.5351C22.4722 27.5351 27.1827 22.8256 27.1827 17.0361C27.1827 11.2467 22.4722 6.53715 16.6815 6.53715Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$2, 9, 2, 225);
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$2, 8, 0, 182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CircleWithHole", slots, []);
    	let { fill = ColorScheme.blue } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	const writable_props = ["fill", "xPos", "yPos"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CircleWithHole> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos];
    }

    class CircleWithHole extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, not_equal, { fill: 0, xPos: 1, yPos: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CircleWithHole",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get fill() {
    		throw new Error("<CircleWithHole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<CircleWithHole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<CircleWithHole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<CircleWithHole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<CircleWithHole>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<CircleWithHole>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/DoubleCircle.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/background/shapes/DoubleCircle.svelte";

    // (20:38) 
    function create_if_block_3(ctx) {
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M20.2542 33.2996C27.5452 33.2996 33.4557 27.3903 33.4557 20.1008C33.4557 12.8114 27.5452 6.9021 20.2542 6.9021C12.9632 6.9021 7.05273 12.8114 7.05273 20.1008C7.05273 27.3903 12.9632 33.2996 20.2542 33.2996Z");
    			attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			add_location(path0, file$3, 20, 4, 2479);
    			attr_dev(path1, "d", "M13.6546 3.30245C19.2752 3.30245 23.8557 7.88201 23.8557 13.5015C23.8557 19.1209 19.2752 23.7005 13.6546 23.7005C8.03398 23.7005 3.45346 19.1209 3.45346 13.5015C3.45346 7.88201 8.03398 3.30245 13.6546 3.30245ZM13.6546 0.302734C6.36379 0.302734 0.453125 6.21217 0.453125 13.5015C0.453125 20.7908 6.36379 26.7002 13.6546 26.7002C20.9454 26.7002 26.8561 20.7908 26.8561 13.5015C26.8561 6.21217 20.9454 0.302734 13.6546 0.302734Z");
    			attr_dev(path1, "fill", "#3D3D3D");
    			add_location(path1, file$3, 21, 4, 2714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(20:38) ",
    		ctx
    	});

    	return block;
    }

    // (17:37) 
    function create_if_block_2(ctx) {
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M14.1487 32.6986C21.4397 32.6986 27.3502 26.9684 27.3502 19.8999C27.3502 12.8313 21.4397 7.10107 14.1487 7.10107C6.85778 7.10107 0.947266 12.8313 0.947266 19.8999C0.947266 26.9684 6.85778 32.6986 14.1487 32.6986Z");
    			attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			add_location(path0, file$3, 17, 4, 1751);
    			attr_dev(path1, "d", "M20.7484 3.69075C26.369 3.69075 30.9495 8.09032 30.9495 13.4898C30.9495 18.8893 26.369 23.2889 20.7484 23.2889C15.1277 23.2889 10.5472 18.8893 10.5472 13.4898C10.5472 8.09032 15.1277 3.69075 20.7484 3.69075ZM20.7484 0.69104C13.4575 0.69104 7.54688 6.42048 7.54688 13.4898C7.54688 20.5591 13.4575 26.2886 20.7484 26.2886C28.0392 26.2886 33.9498 20.5591 33.9498 13.4898C33.9498 6.42048 28.0392 0.69104 20.7484 0.69104Z");
    			attr_dev(path1, "fill", "#3D3D3D");
    			add_location(path1, file$3, 18, 4, 1992);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:37) ",
    		ctx
    	});

    	return block;
    }

    // (14:35) 
    function create_if_block_1$1(ctx) {
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M20.3284 25.6786C27.6194 25.6786 33.5299 19.9484 33.5299 12.8799C33.5299 5.81128 27.6194 0.0810547 20.3284 0.0810547C13.0375 0.0810547 7.12695 5.81128 7.12695 12.8799C7.12695 19.9484 13.0375 25.6786 20.3284 25.6786Z");
    			attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			add_location(path0, file$3, 14, 4, 1022);
    			attr_dev(path1, "d", "M13.7288 9.48079C19.3495 9.48079 23.93 13.8804 23.93 19.2798C23.93 24.6793 19.3495 29.0789 13.7288 29.0789C8.10821 29.0789 3.52768 24.6793 3.52768 19.2798C3.52768 13.8804 8.09821 9.48079 13.7288 9.48079ZM13.7288 6.48108C6.43802 6.48108 0.527344 12.2105 0.527344 19.2798C0.527344 26.3492 6.43802 32.0786 13.7288 32.0786C21.0197 32.0786 26.9303 26.3492 26.9303 19.2798C26.9303 12.2105 21.0197 6.48108 13.7288 6.48108Z");
    			attr_dev(path1, "fill", "#3D3D3D");
    			add_location(path1, file$3, 15, 4, 1266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(14:35) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if rotation == 'topLeft'}
    function create_if_block$2(ctx) {
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M13.2151 26.8771C20.5061 26.8771 26.4166 20.9678 26.4166 13.6783C26.4166 6.38888 20.5061 0.479614 13.2151 0.479614C5.92417 0.479614 0.0136719 6.38888 0.0136719 13.6783C0.0136719 20.9678 5.92417 26.8771 13.2151 26.8771Z");
    			attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			add_location(path0, file$3, 11, 3, 291);
    			attr_dev(path1, "d", "M19.8148 10.0787C25.4354 10.0787 30.0159 14.6583 30.0159 20.2777C30.0159 25.8972 25.4354 30.4768 19.8148 30.4768C14.1941 30.4768 9.61362 25.8972 9.61362 20.2777C9.61362 14.6583 14.1941 10.0787 19.8148 10.0787ZM19.8148 7.07898C12.5239 7.07898 6.61328 12.9884 6.61328 20.2777C6.61328 27.567 12.5239 33.4765 19.8148 33.4765C27.1056 33.4765 33.0162 27.567 33.0162 20.2777C33.0162 12.9884 27.1056 7.07898 19.8148 7.07898Z");
    			attr_dev(path1, "fill", "#3D3D3D");
    			add_location(path1, file$3, 12, 4, 538);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path0, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:2) {#if rotation == 'topLeft'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*rotation*/ ctx[3] == "topLeft") return create_if_block$2;
    		if (/*rotation*/ ctx[3] == "topRight") return create_if_block_1$1;
    		if (/*rotation*/ ctx[3] == "bottomLeft") return create_if_block_2;
    		if (/*rotation*/ ctx[3] == "bottomRight") return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$3, 9, 0, 217);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DoubleCircle", slots, []);
    	let { fill = ColorScheme.orange } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = "topLeft" } = $$props;
    	const writable_props = ["fill", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DoubleCircle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos, rotation });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos, rotation];
    }

    class DoubleCircle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, not_equal, { fill: 0, xPos: 1, yPos: 2, rotation: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DoubleCircle",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get fill() {
    		throw new Error("<DoubleCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<DoubleCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<DoubleCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<DoubleCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<DoubleCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<DoubleCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<DoubleCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<DoubleCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/HalfCircle.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/background/shapes/HalfCircle.svelte";

    // (17:35) 
    function create_if_block_3$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M20.0356 35.3667C15.0051 35.3667 9.97451 33.4569 6.14408 29.6273C-1.51678 21.968 -1.51678 9.50922 6.14408 1.84995C7.31421 0.680062 9.21441 0.680062 10.3845 1.84995C11.5547 3.01984 11.5547 4.91966 10.3845 6.08954C5.06395 11.409 5.06395 20.0582 10.3845 25.3777C15.7051 30.6972 24.3561 30.6972 29.6767 25.3777C30.8469 24.2078 32.7471 24.2078 33.9172 25.3777C35.0873 26.5476 35.0873 28.4474 33.9172 29.6173C30.0968 33.4469 25.0662 35.3667 20.0356 35.3667Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$4, 17, 4, 1831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(17:35) ",
    		ctx
    	});

    	return block;
    }

    // (15:37) 
    function create_if_block_2$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M8.4401 34.941C7.67001 34.941 6.89993 34.651 6.31987 34.0611C-1.341 26.4018 -1.341 13.943 6.31987 6.28376C13.9807 -1.37551 26.4421 -1.37551 34.103 6.28376C35.2731 7.45364 35.2731 9.35345 34.103 10.5233C32.9329 11.6932 31.0326 11.6932 29.8625 10.5233C24.5419 5.20385 15.8909 5.20385 10.5703 10.5233C5.24974 15.8428 5.24974 24.492 10.5703 29.8115C11.7405 30.9814 11.7405 32.8812 10.5703 34.0511C9.97028 34.641 9.20018 34.941 8.4401 34.941Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$4, 15, 4, 1329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(15:37) ",
    		ctx
    	});

    	return block;
    }

    // (13:34) 
    function create_if_block_1$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M26.718 35.0411C25.9479 35.0411 25.1778 34.7511 24.5978 34.1612C23.4276 32.9913 23.4276 31.0915 24.5978 29.9216C29.9184 24.6021 29.9184 15.9529 24.5978 10.6334C19.2772 5.31396 10.6262 5.31396 5.30556 10.6334C4.13543 11.8033 2.23523 11.8033 1.0651 10.6334C-0.105033 9.46356 -0.105033 7.56375 1.0651 6.39386C8.72595 -1.2654 21.1874 -1.2654 28.8482 6.39386C36.5091 14.0531 36.5091 26.5119 28.8482 34.1712C28.2482 34.7511 27.4781 35.0411 26.718 35.0411Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$4, 13, 4, 813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(13:34) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if rotation == 'bottomRight'}
    function create_if_block$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M15.4215 35.0145C10.3909 35.0145 5.36037 33.1046 1.52994 29.275C0.359811 28.1051 0.359811 26.2053 1.52994 25.0354C2.70007 23.8655 4.60029 23.8655 5.77042 25.0354C11.091 30.3549 19.742 30.3549 25.0626 25.0354C30.3832 19.7159 30.3832 11.0667 25.0626 5.74725C23.8925 4.57736 23.8925 2.67755 25.0626 1.50766C26.2327 0.337777 28.1329 0.337777 29.3031 1.50766C36.9639 9.16693 36.9639 21.6257 29.3031 29.285C25.4826 33.0946 20.4521 35.0145 15.4215 35.0145Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$4, 11, 4, 300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(11:2) {#if rotation == 'bottomRight'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*rotation*/ ctx[3] == "bottomRight") return create_if_block$3;
    		if (/*rotation*/ ctx[3] == "topLeft") return create_if_block_1$2;
    		if (/*rotation*/ ctx[3] == "bottomLeft") return create_if_block_2$1;
    		if (/*rotation*/ ctx[3] == "topRight") return create_if_block_3$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$4, 9, 0, 221);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HalfCircle", slots, []);
    	let { fill = ColorScheme.orange } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = "bottomRight" } = $$props;
    	const writable_props = ["fill", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HalfCircle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos, rotation });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos, rotation];
    }

    class HalfCircle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, not_equal, { fill: 0, xPos: 1, yPos: 2, rotation: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HalfCircle",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get fill() {
    		throw new Error("<HalfCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<HalfCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<HalfCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<HalfCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<HalfCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<HalfCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<HalfCircle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<HalfCircle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/Snake.svelte generated by Svelte v3.31.0 */
    const file$5 = "src/background/shapes/Snake.svelte";

    // (13:31) 
    function create_if_block_1$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M41.6332 53.29C40.8631 53.29 40.093 53 39.513 52.4101C36.4726 49.3704 36.5726 46.0907 36.6426 43.6909C36.7026 41.5511 36.6827 40.5512 35.5225 39.3913C34.3624 38.2314 33.3723 38.2114 31.222 38.2714C28.8218 38.3414 25.5414 38.4414 22.5011 35.4017C19.4607 32.362 19.5607 29.0823 19.6307 26.6825C19.6907 24.5427 19.6707 23.5428 18.5106 22.3829C17.3505 21.2231 16.3604 21.2031 14.2101 21.2631C11.8099 21.333 8.52949 21.433 5.48915 18.3933C2.4488 15.3536 2.54882 12.0739 2.61883 9.67417C2.67884 7.53437 2.65882 6.53447 1.49869 5.37458C0.328561 4.20469 0.328561 2.30487 1.49869 1.13498C2.66882 -0.0349036 4.56904 -0.0349036 5.73917 1.13498C8.77952 4.17469 8.6795 7.45438 8.60949 9.85415C8.54949 11.9939 8.5695 12.9939 9.72963 14.1537C10.8898 15.3136 11.8899 15.3336 14.0301 15.2736C16.4304 15.2036 19.7107 15.1037 22.7511 18.1434C25.7914 21.1831 25.6914 24.4628 25.6214 26.8625C25.5614 29.0023 25.5814 30.0022 26.7415 31.1621C27.9017 32.322 28.9018 32.342 31.042 32.282C33.4423 32.212 36.7227 32.112 39.763 35.1517C42.8033 38.1914 42.7033 41.4711 42.6333 43.8709C42.5733 46.0107 42.5933 47.0106 43.7534 48.1705C44.9236 49.3404 44.9236 51.2402 43.7534 52.4101C43.1634 53 42.3933 53.29 41.6332 53.29Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$5, 13, 4, 1547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(13:31) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if rotation == 'right'}
    function create_if_block$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M3.93534 53.1866C3.16525 53.1866 2.39516 52.8966 1.8151 52.3067C0.644967 51.1368 0.644967 49.237 1.8151 48.0671C2.97523 46.9072 2.99523 45.9073 2.93522 43.7675C2.86522 41.3677 2.7652 38.088 5.80555 35.0483C8.84589 32.0086 12.1263 32.1086 14.5265 32.1786C16.6668 32.2386 17.6669 32.2186 18.827 31.0587C19.9871 29.8988 20.0071 28.8989 19.9471 26.7591C19.8771 24.3594 19.7771 21.0797 22.8175 18.04C25.8578 15.0003 29.1482 15.1003 31.5384 15.1702C33.6787 15.2302 34.6788 15.2102 35.8389 14.0503C36.9991 12.8904 37.0191 11.8905 36.959 9.75075C36.889 7.35098 36.789 4.0713 39.8294 1.03159C40.9995 -0.138297 42.8997 -0.138297 44.0698 1.03159C45.24 2.20148 45.24 4.10129 44.0698 5.27117C42.9097 6.43106 42.8897 7.43098 42.9497 9.57078C43.0197 11.9705 43.1197 15.2502 40.0794 18.2899C37.0391 21.3297 33.7587 21.2297 31.3584 21.1597C29.2082 21.0997 28.2181 21.1197 27.0579 22.2796C25.8978 23.4394 25.8778 24.4393 25.9378 26.5791C26.0078 28.9789 26.1078 32.2586 23.0675 35.2983C20.0271 38.338 16.7468 38.238 14.3465 38.168C12.2063 38.098 11.2062 38.128 10.046 39.2879C8.88589 40.4478 8.86589 41.4477 8.9259 43.5875C8.9959 45.9873 9.09592 49.267 6.05557 52.3067C5.46551 52.8866 4.70542 53.1866 3.93534 53.1866Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$5, 11, 4, 288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(11:2) {#if rotation == 'right'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*rotation*/ ctx[3] == "right") return create_if_block$4;
    		if (/*rotation*/ ctx[3] == "left") return create_if_block_1$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$5, 9, 0, 215);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Snake", slots, []);
    	let { fill = ColorScheme.orange } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = "right" } = $$props;
    	const writable_props = ["fill", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Snake> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos, rotation });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos, rotation];
    }

    class Snake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, not_equal, { fill: 0, xPos: 1, yPos: 2, rotation: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Snake",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get fill() {
    		throw new Error("<Snake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Snake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<Snake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<Snake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<Snake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<Snake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Snake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Snake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/Triangle.svelte generated by Svelte v3.31.0 */
    const file$6 = "src/background/shapes/Triangle.svelte";

    // (13:32) 
    function create_if_block_1$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M31.0243 33.7832C30.8043 33.7832 30.5942 33.7533 30.3742 33.7033L1.99103 26.104C1.13094 25.874 0.450841 25.1941 0.220815 24.3342C-0.00921111 23.4742 0.240811 22.5543 0.870882 21.9244L21.6432 1.15637C22.2733 0.526434 23.1934 0.276464 24.0535 0.506442C24.9136 0.73642 25.5937 1.41634 25.8237 2.27626L33.4246 30.6535C33.6546 31.5135 33.4046 32.4334 32.7745 33.0633C32.3145 33.5233 31.6744 33.7832 31.0243 33.7832ZM7.47163 22.3843L27.4839 27.7438L22.1233 7.73574L7.47163 22.3843Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$6, 13, 4, 808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(13:32) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if rotation == 'left'}
    function create_if_block$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M3.03952 34.0884C2.38945 34.0884 1.74938 33.8284 1.26933 33.3585C0.639255 32.7285 0.389225 31.8086 0.619251 30.9487L8.2201 2.57143C8.45013 1.71151 9.13021 1.03159 9.9903 0.801608C10.8504 0.57163 11.7705 0.8216 12.4006 1.45154L33.1729 22.2196C33.803 22.8495 34.053 23.7694 33.823 24.6293C33.5929 25.4892 32.9129 26.1692 32.0528 26.3991L3.6696 33.9984C3.46957 34.0584 3.25955 34.0884 3.03952 34.0884ZM11.9405 8.0409L6.57992 28.049L26.5922 22.6895L11.9405 8.0409Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$6, 11, 4, 286);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(11:2) {#if rotation == 'left'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*rotation*/ ctx[3] == "left") return create_if_block$5;
    		if (/*rotation*/ ctx[3] == "right") return create_if_block_1$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$6, 9, 0, 214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Triangle", slots, []);
    	let { fill = ColorScheme.orange } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = "left" } = $$props;
    	const writable_props = ["fill", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Triangle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos, rotation });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos, rotation];
    }

    class Triangle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, not_equal, { fill: 0, xPos: 1, yPos: 2, rotation: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Triangle",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get fill() {
    		throw new Error("<Triangle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Triangle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<Triangle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<Triangle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<Triangle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<Triangle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Triangle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Triangle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/shapes/Zigzag.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/background/shapes/Zigzag.svelte";

    // (13:32) 
    function create_if_block_1$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M20.6895 38.1031C20.5795 38.1031 20.4695 38.0931 20.3595 38.0831L2.70749 36.1232C1.05731 35.9433 -0.122821 34.4534 0.057199 32.8136C0.237219 31.1637 1.72739 29.9838 3.36757 30.1638L17.6092 31.7437L17.2991 19.0949C17.2791 18.275 17.5992 17.485 18.1792 16.9051C18.7593 16.3251 19.5494 16.0052 20.3695 16.0252L33.3009 16.3451L32.9809 3.41638C32.9609 2.59646 33.2809 1.80654 33.861 1.22659C34.4411 0.646646 35.2412 0.336671 36.0513 0.34667L52.1331 0.736632C53.7932 0.776628 55.1034 2.1565 55.0634 3.80635C55.0234 5.46619 53.6332 6.75606 51.9931 6.73606L39.0616 6.4161L39.3816 19.3449C39.4016 20.1648 39.0816 20.9547 38.5015 21.5346C37.9215 22.1146 37.1214 22.4246 36.3113 22.4146L23.3798 22.0946L23.6999 35.0233C23.7199 35.8933 23.3698 36.7232 22.7297 37.3031C22.1597 37.8231 21.4396 38.1031 20.6895 38.1031Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$7, 13, 4, 717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(13:32) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if rotation == 'left'}
    function create_if_block$6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M33.0261 39.1358L33.4161 23.0573L17.3344 23.4473L17.7244 7.6488L3.4828 9.22865C1.84262 9.41864 0.352454 8.22876 0.172433 6.57891C-0.00758685 4.92907 1.17254 3.4492 2.82272 3.26922L23.8951 0.929443L23.495 17.2979L39.5768 16.9079L39.1868 32.9764L52.1183 32.6564C53.7584 32.6164 55.1486 33.9263 55.1886 35.5861C55.2286 37.246 53.9185 38.6158 52.2583 38.6558L33.0261 39.1358Z");
    			attr_dev(path, "fill", /*fill*/ ctx[0]);
    			add_location(path, file$7, 11, 4, 284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(path, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(11:2) {#if rotation == 'left'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let g;
    	let g_transform_value;

    	function select_block_type(ctx, dirty) {
    		if (/*rotation*/ ctx[3] == "left") return create_if_block$6;
    		if (/*rotation*/ ctx[3] == "right") return create_if_block_1$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")");
    			add_location(g, file$7, 9, 0, 212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}

    			if (dirty & /*xPos, yPos*/ 6 && g_transform_value !== (g_transform_value = "translate(" + /*xPos*/ ctx[1] + "," + /*yPos*/ ctx[2] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Zigzag", slots, []);
    	let { fill = ColorScheme.blue } = $$props;
    	let { xPos = 0 } = $$props;
    	let { yPos = 0 } = $$props;
    	let { rotation = "left" } = $$props;
    	const writable_props = ["fill", "xPos", "yPos", "rotation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Zigzag> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ ColorScheme, fill, xPos, yPos, rotation });

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("xPos" in $$props) $$invalidate(1, xPos = $$props.xPos);
    		if ("yPos" in $$props) $$invalidate(2, yPos = $$props.yPos);
    		if ("rotation" in $$props) $$invalidate(3, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, xPos, yPos, rotation];
    }

    class Zigzag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, not_equal, { fill: 0, xPos: 1, yPos: 2, rotation: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Zigzag",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get fill() {
    		throw new Error("<Zigzag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Zigzag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPos() {
    		throw new Error("<Zigzag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPos(value) {
    		throw new Error("<Zigzag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPos() {
    		throw new Error("<Zigzag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPos(value) {
    		throw new Error("<Zigzag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<Zigzag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<Zigzag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // config for shapes for a single repeating tile
    const shapesConfig = [
        { component: HalfCircle, xPos: 12, yPos: 20, fill: ColorScheme.blue },
        { component: Circle, xPos: 22, yPos: 60, width: 14, fill: ColorScheme.yellow },
        { component: Cross, xPos: 0, yPos: 200, fill: ColorScheme.blue },
        { component: CircleWithHole, xPos: 11, yPos: 128, fill: ColorScheme.orange },
        { component: Circle, xPos: 15, yPos: 285, width: 14, fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 22, yPos: 382, width: 10, fill: ColorScheme.pink },
        { component: Cross, xPos: 9, yPos: 439, rotation: "45", fill: ColorScheme.pink },
        { component: Circle, xPos: 34, yPos: 506, fill: ColorScheme.blue },
        { component: Cross, xPos: 78, yPos: 30, rotation: "45", fill: ColorScheme.darkGrey },
        { component: Circle, xPos: 63, yPos: 225, fill: ColorScheme.pink },
        { component: Snake, xPos: 53, yPos: 270, rotation: "right", fill: ColorScheme.blue },
        { component: Triangle, xPos: 83, yPos: 400, rotation: "left", fill: ColorScheme.green },
        { component: Circle, xPos: 120, yPos: 498, width: 14, fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 135, yPos: 17, width: 8, fill: ColorScheme.pink },
        { component: Circle, xPos: 126, yPos: 78, width: 8, fill: ColorScheme.lightGrey },
        { component: HalfCircle, xPos: 89, yPos: 127, rotation: "bottomRight", fill: ColorScheme.blue },
        { component: Zigzag, xPos: 112, yPos: 214, rotation: "left", fill: ColorScheme.darkGrey },
        { component: DoubleCircle, xPos: 123, yPos: 317, fill: ColorScheme.yellow },
        { component: Circle, xPos: 156, yPos: 431, width: 8, fill: ColorScheme.green },
        { component: Circle, xPos: 120, yPos: 498, width: 14, fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 199, yPos: 12, width: 14, fill: ColorScheme.lightGrey },
        { component: Snake, xPos: 175, yPos: 51, rotation: "left", fill: ColorScheme.orange },
        { component: Cross, xPos: 185, yPos: 139, fill: ColorScheme.darkGrey },
        { component: Circle, xPos: 163, yPos: 188, width: 8, fill: ColorScheme.green },
        { component: Circle, xPos: 188, yPos: 277, width: 8, fill: ColorScheme.pink },
        { component: HalfCircle, xPos: 184, yPos: 372, rotation: "bottomLeft", fill: ColorScheme.orange },
        { component: Zigzag, xPos: 193, yPos: 473, rotation: "left", fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 252, yPos: 0, width: 8, fill: ColorScheme.green },
        { component: HalfCircle, xPos: 270, yPos: 29, rotation: "bottomLeft", fill: ColorScheme.green },
        { component: Circle, xPos: 213, yPos: 213, width: 14, fill: ColorScheme.lightGrey },
        { component: DoubleCircle, xPos: 249, yPos: 129, fill: ColorScheme.pink },
        { component: HalfCircle, xPos: 271, yPos: 213, rotation: "topRight", fill: ColorScheme.orange },
        { component: Cross, xPos: 232, yPos: 313, fill: ColorScheme.green },
        { component: Circle, xPos: 257, yPos: 427, width: 8, fill: ColorScheme.pink },
        { component: Circle, xPos: 311, yPos: 282, width: 8, fill: ColorScheme.blue },
        { component: Circle, xPos: 287, yPos: 337, width: 14, fill: ColorScheme.lightGrey },
        { component: Cross, xPos: 311, yPos: 397, fill: ColorScheme.darkGrey },
        { component: Snake, xPos: 306, yPos: 460, rotation: "right", fill: ColorScheme.green },
        { component: Circle, xPos: 352, yPos: 37, width: 8, fill: ColorScheme.blue },
        { component: Circle, xPos: 330, yPos: 102, width: 8, fill: ColorScheme.pink },
        { component: Cross, xPos: 324, yPos: 182, rotation: "45", fill: ColorScheme.darkGrey },
        { component: DoubleCircle, xPos: 346, yPos: 302, rotation: "topRight", fill: ColorScheme.green },
        { component: Snake, xPos: 375, yPos: 391, rotation: "left", fill: ColorScheme.blue },
        { component: Cross, xPos: 401, yPos: 480, fill: ColorScheme.orange },
        { component: DoubleCircle, xPos: 400, yPos: 1, rotation: "topRight", fill: ColorScheme.yellow },
        { component: Cross, xPos: 404, yPos: 79, fill: ColorScheme.blue },
        { component: Triangle, xPos: 379, yPos: 141, rotation: "right", fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 379, yPos: 239, width: 14, fill: ColorScheme.lightGrey },
        { component: Cross, xPos: 492, yPos: 26, fill: ColorScheme.orange },
        { component: Snake, xPos: 471, yPos: 80, rotation: "left", fill: ColorScheme.blue },
        { component: Circle, xPos: 458, yPos: 166, width: 8, fill: ColorScheme.green },
        { component: Zigzag, xPos: 420, yPos: 243, rotation: "right", fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 450, yPos: 333, width: 14, fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 420, yPos: 372, width: 8, fill: ColorScheme.green },
        { component: Cross, xPos: 479, yPos: 395, fill: ColorScheme.blue },
        { component: Circle, xPos: 455, yPos: 451, width: 8, fill: ColorScheme.pink },
        { component: DoubleCircle, xPos: 492, yPos: 484, rotation: "bottomLeft", fill: ColorScheme.pink },
        { component: Snake, xPos: 560, yPos: 15, rotation: "right", fill: ColorScheme.green },
        { component: Cross, xPos: 574, yPos: 111, fill: ColorScheme.darkGrey },
        { component: DoubleCircle, xPos: 520, yPos: 197, rotation: "bottomLeft", fill: ColorScheme.yellow },
        { component: HalfCircle, xPos: 503, yPos: 308, rotation: "bottomRight", fill: ColorScheme.orange },
        { component: Circle, xPos: 600, yPos: 167, width: 14, fill: ColorScheme.lightGrey },
        { component: HalfCircle, xPos: 594, yPos: 266, rotation: "topLeft", fill: ColorScheme.darkGrey },
        { component: Cross, xPos: 615, yPos: 356, rotation: "45", fill: ColorScheme.lightGrey },
        { component: DoubleCircle, xPos: 550, yPos: 388, fill: ColorScheme.yellow },
        { component: Circle, xPos: 559, yPos: 464, width: 8, fill: ColorScheme.blue },
        { component: DoubleCircle, xPos: 618, yPos: 465, rotation: "bottomRight", fill: ColorScheme.orange },
        { component: Zigzag, xPos: 651, yPos: 13, rotation: "left", fill: ColorScheme.darkGrey },
        { component: Circle, xPos: 634, yPos: 78, width: 8, fill: ColorScheme.pink },
        { component: HalfCircle, xPos: 681, yPos: 107, rotation: "bottomRight", fill: ColorScheme.orange },
        { component: Cross, xPos: 664, yPos: 191, fill: ColorScheme.green },
        { component: Circle, xPos: 703, yPos: 238, width: 8, fill: ColorScheme.pink },
        { component: Circle, xPos: 677, yPos: 286, width: 14, fill: ColorScheme.blue },
        { component: Cross, xPos: 700, yPos: 370, fill: ColorScheme.darkGrey },
        { component: Snake, xPos: 680, yPos: 420, rotation: "left", fill: ColorScheme.darkGrey },
        { component: Circle, xPos: 699, yPos: 507, width: 14, fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 766, yPos: 28, width: 8, fill: ColorScheme.blue },
        { component: Cross, xPos: 762, yPos: 109, fill: ColorScheme.blue },
        { component: DoubleCircle, xPos: 740, yPos: 180, rotation: "bottomRight", fill: ColorScheme.pink },
        { component: Zigzag, xPos: 743, yPos: 281, rotation: "left", fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 728, yPos: 327, width: 8, fill: ColorScheme.green },
        { component: HalfCircle, xPos: 786, yPos: 372, rotation: "bottomLeft", fill: ColorScheme.orange },
        { component: Circle, xPos: 796, yPos: 448, width: 8, fill: ColorScheme.lightGrey },
        { component: Circle, xPos: 769, yPos: 502, width: 8, fill: ColorScheme.pink },
        { component: HalfCircle, xPos: 846, yPos: 3, rotation: "topRight", fill: ColorScheme.orange },
        { component: DoubleCircle, xPos: 817, yPos: 72, rotation: "topRight", fill: ColorScheme.yellow },
        { component: Cross, xPos: 858, yPos: 150, rotation: "45", fill: ColorScheme.lightGrey },
        { component: Snake, xPos: 808, yPos: 195, rotation: "right", fill: ColorScheme.orange },
        { component: Cross, xPos: 871, yPos: 272, fill: ColorScheme.darkGrey },
        { component: Circle, xPos: 828, yPos: 290, width: 8, fill: ColorScheme.pink },
        { component: DoubleCircle, xPos: 857, yPos: 341, rotation: "bottomLeft", fill: ColorScheme.green },
        { component: Circle, xPos: 866, yPos: 430, width: 14, fill: ColorScheme.yellow },
        { component: Cross, xPos: 830, yPos: 486, rotation: "45", fill: ColorScheme.darkGrey },
    ];

    /* src/background/BackgroundTile.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (26:0) {#each filteredShapes as shape (shape)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*shape*/ ctx[6].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				xPos: /*shape*/ ctx[6].xPos,
    				yPos: /*shape*/ ctx[6].yPos,
    				fill: /*shape*/ ctx[6].fill,
    				width: /*shape*/ ctx[6].width,
    				rotation: /*shape*/ ctx[6].rotation
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*filteredShapes*/ 1) switch_instance_changes.xPos = /*shape*/ ctx[6].xPos;
    			if (dirty & /*filteredShapes*/ 1) switch_instance_changes.yPos = /*shape*/ ctx[6].yPos;
    			if (dirty & /*filteredShapes*/ 1) switch_instance_changes.fill = /*shape*/ ctx[6].fill;
    			if (dirty & /*filteredShapes*/ 1) switch_instance_changes.width = /*shape*/ ctx[6].width;
    			if (dirty & /*filteredShapes*/ 1) switch_instance_changes.rotation = /*shape*/ ctx[6].rotation;

    			if (switch_value !== (switch_value = /*shape*/ ctx[6].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:0) {#each filteredShapes as shape (shape)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*filteredShapes*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*shape*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filteredShapes*/ 1) {
    				const each_value = /*filteredShapes*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackgroundTile", slots, []);
    	let { xPosOffset = 0 } = $$props;
    	let { yPosOffset = 0 } = $$props;
    	let { documentWidth } = $$props;
    	let { documentHeight } = $$props;
    	let { contentPos } = $$props;
    	const writable_props = ["xPosOffset", "yPosOffset", "documentWidth", "documentHeight", "contentPos"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackgroundTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("xPosOffset" in $$props) $$invalidate(1, xPosOffset = $$props.xPosOffset);
    		if ("yPosOffset" in $$props) $$invalidate(2, yPosOffset = $$props.yPosOffset);
    		if ("documentWidth" in $$props) $$invalidate(3, documentWidth = $$props.documentWidth);
    		if ("documentHeight" in $$props) $$invalidate(4, documentHeight = $$props.documentHeight);
    		if ("contentPos" in $$props) $$invalidate(5, contentPos = $$props.contentPos);
    	};

    	$$self.$capture_state = () => ({
    		shapesConfig,
    		xPosOffset,
    		yPosOffset,
    		documentWidth,
    		documentHeight,
    		contentPos,
    		filteredShapes
    	});

    	$$self.$inject_state = $$props => {
    		if ("xPosOffset" in $$props) $$invalidate(1, xPosOffset = $$props.xPosOffset);
    		if ("yPosOffset" in $$props) $$invalidate(2, yPosOffset = $$props.yPosOffset);
    		if ("documentWidth" in $$props) $$invalidate(3, documentWidth = $$props.documentWidth);
    		if ("documentHeight" in $$props) $$invalidate(4, documentHeight = $$props.documentHeight);
    		if ("contentPos" in $$props) $$invalidate(5, contentPos = $$props.contentPos);
    		if ("filteredShapes" in $$props) $$invalidate(0, filteredShapes = $$props.filteredShapes);
    	};

    	let filteredShapes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*xPosOffset, yPosOffset, contentPos, documentHeight, documentWidth*/ 62) {
    			 $$invalidate(0, filteredShapes = shapesConfig.map(shape => {
    				// update shape positions to account for tile offsets
    				return Object.assign(Object.assign({}, shape), {
    					xPos: shape.xPos + xPosOffset,
    					yPos: shape.yPos + yPosOffset
    				});
    			}).filter(shape => {
    				// ensure no shapes overlap content
    				if (shape.xPos > contentPos.topLeftX && shape.yPos > contentPos.topLeftY && shape.xPos < contentPos.bottomRightX && shape.yPos < contentPos.bottomRightY || shape.yPos > documentHeight || shape.xPos > documentWidth) {
    					return false;
    				}

    				return true;
    			}));
    		}
    	};

    	return [
    		filteredShapes,
    		xPosOffset,
    		yPosOffset,
    		documentWidth,
    		documentHeight,
    		contentPos
    	];
    }

    class BackgroundTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, not_equal, {
    			xPosOffset: 1,
    			yPosOffset: 2,
    			documentWidth: 3,
    			documentHeight: 4,
    			contentPos: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundTile",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*documentWidth*/ ctx[3] === undefined && !("documentWidth" in props)) {
    			console.warn("<BackgroundTile> was created without expected prop 'documentWidth'");
    		}

    		if (/*documentHeight*/ ctx[4] === undefined && !("documentHeight" in props)) {
    			console.warn("<BackgroundTile> was created without expected prop 'documentHeight'");
    		}

    		if (/*contentPos*/ ctx[5] === undefined && !("contentPos" in props)) {
    			console.warn("<BackgroundTile> was created without expected prop 'contentPos'");
    		}
    	}

    	get xPosOffset() {
    		throw new Error("<BackgroundTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPosOffset(value) {
    		throw new Error("<BackgroundTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPosOffset() {
    		throw new Error("<BackgroundTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPosOffset(value) {
    		throw new Error("<BackgroundTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get documentWidth() {
    		throw new Error("<BackgroundTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set documentWidth(value) {
    		throw new Error("<BackgroundTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get documentHeight() {
    		throw new Error("<BackgroundTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set documentHeight(value) {
    		throw new Error("<BackgroundTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentPos() {
    		throw new Error("<BackgroundTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentPos(value) {
    		throw new Error("<BackgroundTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/background/Background.svelte generated by Svelte v3.31.0 */
    const file$8 = "src/background/Background.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (49:4) {#each Array(tileColumnCount) as _, columnIndex}
    function create_each_block_1(ctx) {
    	let backgroundtile;
    	let current;

    	backgroundtile = new BackgroundTile({
    			props: {
    				xPosOffset: calculateXOffset(/*columnIndex*/ ctx[13]),
    				yPosOffset: calculateYOffset(/*rowIndex*/ ctx[11]),
    				contentPos: /*contentPos*/ ctx[4],
    				documentWidth: /*documentWidth*/ ctx[0],
    				documentHeight: /*documentHeight*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(backgroundtile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(backgroundtile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const backgroundtile_changes = {};
    			if (dirty & /*contentPos*/ 16) backgroundtile_changes.contentPos = /*contentPos*/ ctx[4];
    			if (dirty & /*documentWidth*/ 1) backgroundtile_changes.documentWidth = /*documentWidth*/ ctx[0];
    			if (dirty & /*documentHeight*/ 2) backgroundtile_changes.documentHeight = /*documentHeight*/ ctx[1];
    			backgroundtile.$set(backgroundtile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backgroundtile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backgroundtile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(backgroundtile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(49:4) {#each Array(tileColumnCount) as _, columnIndex}",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#each Array(tileRowCount) as _, rowIndex}
    function create_each_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = Array(/*tileColumnCount*/ ctx[3]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*calculateXOffset, calculateYOffset, contentPos, documentWidth, documentHeight, tileColumnCount*/ 27) {
    				each_value_1 = Array(/*tileColumnCount*/ ctx[3]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(48:2) {#each Array(tileRowCount) as _, rowIndex}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let svg;
    	let current;
    	let each_value = Array(/*tileRowCount*/ ctx[2]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-92qdb7");
    			add_location(svg, file$8, 45, 0, 1175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, tileColumnCount, calculateXOffset, calculateYOffset, contentPos, documentWidth, documentHeight, tileRowCount*/ 31) {
    				each_value = Array(/*tileRowCount*/ ctx[2]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const tileWidth = 895;
    const tileHeight = 530;

    // funcs for calculating tile offsets
    function calculateXOffset(columnIndex) {
    	return columnIndex * tileWidth;
    }

    function calculateYOffset(rowIndex) {
    	return rowIndex * tileHeight;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Background", slots, []);
    	let { documentWidth = 0 } = $$props;
    	let { documentHeight = 0 } = $$props;
    	let { contentWidth = 0 } = $$props;
    	let { contentHeight = 0 } = $$props;
    	let { contentLeft = 0 } = $$props;
    	let { contentTop = 0 } = $$props;
    	let tileRowCount = 0;
    	let tileColumnCount = 0;

    	const writable_props = [
    		"documentWidth",
    		"documentHeight",
    		"contentWidth",
    		"contentHeight",
    		"contentLeft",
    		"contentTop"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("documentWidth" in $$props) $$invalidate(0, documentWidth = $$props.documentWidth);
    		if ("documentHeight" in $$props) $$invalidate(1, documentHeight = $$props.documentHeight);
    		if ("contentWidth" in $$props) $$invalidate(5, contentWidth = $$props.contentWidth);
    		if ("contentHeight" in $$props) $$invalidate(6, contentHeight = $$props.contentHeight);
    		if ("contentLeft" in $$props) $$invalidate(7, contentLeft = $$props.contentLeft);
    		if ("contentTop" in $$props) $$invalidate(8, contentTop = $$props.contentTop);
    	};

    	$$self.$capture_state = () => ({
    		BackgroundTile,
    		documentWidth,
    		documentHeight,
    		contentWidth,
    		contentHeight,
    		contentLeft,
    		contentTop,
    		tileWidth,
    		tileHeight,
    		tileRowCount,
    		tileColumnCount,
    		calculateXOffset,
    		calculateYOffset,
    		contentPos
    	});

    	$$self.$inject_state = $$props => {
    		if ("documentWidth" in $$props) $$invalidate(0, documentWidth = $$props.documentWidth);
    		if ("documentHeight" in $$props) $$invalidate(1, documentHeight = $$props.documentHeight);
    		if ("contentWidth" in $$props) $$invalidate(5, contentWidth = $$props.contentWidth);
    		if ("contentHeight" in $$props) $$invalidate(6, contentHeight = $$props.contentHeight);
    		if ("contentLeft" in $$props) $$invalidate(7, contentLeft = $$props.contentLeft);
    		if ("contentTop" in $$props) $$invalidate(8, contentTop = $$props.contentTop);
    		if ("tileRowCount" in $$props) $$invalidate(2, tileRowCount = $$props.tileRowCount);
    		if ("tileColumnCount" in $$props) $$invalidate(3, tileColumnCount = $$props.tileColumnCount);
    		if ("contentPos" in $$props) $$invalidate(4, contentPos = $$props.contentPos);
    	};

    	let contentPos;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*documentWidth, documentHeight*/ 3) {
    			 if (documentWidth && documentHeight) {
    				$$invalidate(3, tileColumnCount = Math.ceil(documentWidth / tileHeight));
    				$$invalidate(2, tileRowCount = Math.ceil(documentHeight / tileHeight));
    			}
    		}

    		if ($$self.$$.dirty & /*contentLeft, contentTop, contentWidth, contentHeight*/ 480) {
    			// compute bounding box of content - with a bit of padding added on
    			 $$invalidate(4, contentPos = {
    				topLeftX: contentLeft - 10,
    				topLeftY: contentTop - 20,
    				bottomRightX: contentLeft + contentWidth - 15,
    				bottomRightY: contentTop + contentHeight
    			});
    		}
    	};

    	return [
    		documentWidth,
    		documentHeight,
    		tileRowCount,
    		tileColumnCount,
    		contentPos,
    		contentWidth,
    		contentHeight,
    		contentLeft,
    		contentTop
    	];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, not_equal, {
    			documentWidth: 0,
    			documentHeight: 1,
    			contentWidth: 5,
    			contentHeight: 6,
    			contentLeft: 7,
    			contentTop: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get documentWidth() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set documentWidth(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get documentHeight() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set documentHeight(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentWidth() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentWidth(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentHeight() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentHeight(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentLeft() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentLeft(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentTop() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentTop(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Layout.svelte generated by Svelte v3.31.0 */
    const file$9 = "src/Layout.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let background;
    	let t0;
    	let div1;
    	let main;
    	let main_resize_listener;
    	let t1;
    	let div0;
    	let a;
    	let div2_resize_listener;
    	let current;
    	let mounted;
    	let dispose;

    	background = new Background({
    			props: {
    				documentWidth: /*documentWidth*/ ctx[0],
    				documentHeight: /*documentHeight*/ ctx[1],
    				contentWidth: /*contentWidth*/ ctx[3],
    				contentHeight: /*contentHeight*/ ctx[4],
    				contentTop: /*contentTop*/ ctx[5],
    				contentLeft: /*contentLeft*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(background.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "View Source";
    			attr_dev(main, "class", "svelte-qfrbhj");
    			add_render_callback(() => /*main_elementresize_handler*/ ctx[10].call(main));
    			add_location(main, file$9, 78, 4, 1404);
    			attr_dev(a, "href", "https://github.com/maximilianhurl/maxhurl-site");
    			attr_dev(a, "class", "svelte-qfrbhj");
    			add_location(a, file$9, 87, 6, 1593);
    			attr_dev(div0, "class", "view-source svelte-qfrbhj");
    			add_location(div0, file$9, 86, 4, 1561);
    			attr_dev(div1, "class", "content-wrapper svelte-qfrbhj");
    			add_location(div1, file$9, 77, 2, 1370);
    			attr_dev(div2, "class", "document-wrapper svelte-qfrbhj");
    			add_render_callback(() => /*div2_elementresize_handler*/ ctx[12].call(div2));
    			add_location(div2, file$9, 63, 0, 1048);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(background, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, main);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			main_resize_listener = add_resize_listener(main, /*main_elementresize_handler*/ ctx[10].bind(main));
    			/*main_binding*/ ctx[11](main);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[12].bind(div2));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onResize*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const background_changes = {};
    			if (dirty & /*documentWidth*/ 1) background_changes.documentWidth = /*documentWidth*/ ctx[0];
    			if (dirty & /*documentHeight*/ 2) background_changes.documentHeight = /*documentHeight*/ ctx[1];
    			if (dirty & /*contentWidth*/ 8) background_changes.contentWidth = /*contentWidth*/ ctx[3];
    			if (dirty & /*contentHeight*/ 16) background_changes.contentHeight = /*contentHeight*/ ctx[4];
    			if (dirty & /*contentTop*/ 32) background_changes.contentTop = /*contentTop*/ ctx[5];
    			if (dirty & /*contentLeft*/ 64) background_changes.contentLeft = /*contentLeft*/ ctx[6];
    			background.$set(background_changes);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(background);
    			if (default_slot) default_slot.d(detaching);
    			main_resize_listener();
    			/*main_binding*/ ctx[11](null);
    			div2_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	let documentWidth;
    	let documentHeight;
    	let mainElement;
    	let contentWidth;
    	let contentHeight;
    	let contentTop;
    	let contentLeft;

    	function onResize() {
    		if (mainElement) {
    			$$invalidate(5, contentTop = mainElement.offsetTop);
    			$$invalidate(6, contentLeft = mainElement.offsetLeft);
    		}
    	}

    	onMount(onResize);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	function main_elementresize_handler() {
    		contentWidth = this.clientWidth;
    		contentHeight = this.clientHeight;
    		$$invalidate(3, contentWidth);
    		$$invalidate(4, contentHeight);
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			mainElement = $$value;
    			$$invalidate(2, mainElement);
    		});
    	}

    	function div2_elementresize_handler() {
    		documentWidth = this.clientWidth;
    		documentHeight = this.clientHeight;
    		$$invalidate(0, documentWidth);
    		$$invalidate(1, documentHeight);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Background,
    		documentWidth,
    		documentHeight,
    		mainElement,
    		contentWidth,
    		contentHeight,
    		contentTop,
    		contentLeft,
    		onResize
    	});

    	$$self.$inject_state = $$props => {
    		if ("documentWidth" in $$props) $$invalidate(0, documentWidth = $$props.documentWidth);
    		if ("documentHeight" in $$props) $$invalidate(1, documentHeight = $$props.documentHeight);
    		if ("mainElement" in $$props) $$invalidate(2, mainElement = $$props.mainElement);
    		if ("contentWidth" in $$props) $$invalidate(3, contentWidth = $$props.contentWidth);
    		if ("contentHeight" in $$props) $$invalidate(4, contentHeight = $$props.contentHeight);
    		if ("contentTop" in $$props) $$invalidate(5, contentTop = $$props.contentTop);
    		if ("contentLeft" in $$props) $$invalidate(6, contentLeft = $$props.contentLeft);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		documentWidth,
    		documentHeight,
    		mainElement,
    		contentWidth,
    		contentHeight,
    		contentTop,
    		contentLeft,
    		onResize,
    		$$scope,
    		slots,
    		main_elementresize_handler,
    		main_binding,
    		div2_elementresize_handler
    	];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/content/List.svelte generated by Svelte v3.31.0 */

    const file$a = "src/content/List.svelte";

    function create_fragment$d(ctx) {
    	let ul;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "class", "svelte-1s7wk4d");
    			add_location(ul, file$a, 8, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/content/ListItem.svelte generated by Svelte v3.31.0 */

    const file$b = "src/content/ListItem.svelte";

    function create_fragment$e(ctx) {
    	let li;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			attr_dev(li, "class", "svelte-9i6z1i");
    			add_location(li, file$b, 17, 0, 237);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/content/Title.svelte generated by Svelte v3.31.0 */

    const file$c = "src/content/Title.svelte";

    function create_fragment$f(ctx) {
    	let h1;
    	let t1;
    	let h3;
    	let t2;
    	let br;
    	let t3;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Max Hurl";
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("Full-stack developer, Team Lead ");
    			br = element("br");
    			t3 = text("& Biscuit eater");
    			attr_dev(h1, "class", "svelte-ky2si9");
    			add_location(h1, file$c, 20, 0, 248);
    			attr_dev(br, "class", "svelte-ky2si9");
    			add_location(br, file$c, 21, 36, 302);
    			attr_dev(h3, "class", "svelte-ky2si9");
    			add_location(h3, file$c, 21, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t2);
    			append_dev(h3, br);
    			append_dev(h3, t3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Title", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/content/Section.svelte generated by Svelte v3.31.0 */

    const file$d = "src/content/Section.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    function create_fragment$g(ctx) {
    	let h2;
    	let t;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[1].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context);
    	const content_slot_template = /*#slots*/ ctx[1].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[0], get_content_slot_context);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			if (title_slot) title_slot.c();
    			t = space();
    			if (content_slot) content_slot.c();
    			attr_dev(h2, "class", "svelte-1dgdnic");
    			add_location(h2, file$d, 19, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);

    			if (title_slot) {
    				title_slot.m(h2, null);
    			}

    			insert_dev(target, t, anchor);

    			if (content_slot) {
    				content_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (title_slot) title_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (content_slot) content_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, ['title','content']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.31.0 */
    const file$e = "src/routes/Home.svelte";

    // (14:2) <span slot="title">
    function create_title_slot_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "About";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$e, 13, 2, 326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_2.name,
    		type: "slot",
    		source: "(14:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (15:2) <span slot="content">
    function create_content_slot_2(ctx) {
    	let span;
    	let p;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			t0 = text("I’m a full-stack web developer based in Brighton, with 10 years experience\n\t\t\t\ttaking projects from initial requirements through to finished product.");
    			br = element("br");
    			t1 = text("\n\t\t\t\tI enjoy leading other developers and fostering collaboration across the\n\t\t\t\tteam. I’m a firm believer in agile development and always excited to\n\t\t\t\tlearn new technologies");
    			add_location(br, file$e, 17, 74, 542);
    			add_location(p, file$e, 15, 3, 385);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$e, 14, 2, 360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    			append_dev(p, t0);
    			append_dev(p, br);
    			append_dev(p, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_2.name,
    		type: "slot",
    		source: "(15:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:1) <Section>
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(13:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (27:2) <span slot="title">
    function create_title_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Key technologies";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$e, 26, 2, 768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(27:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:4) <ListItem>
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Python - Django");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(30:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (31:4) <ListItem>
    function create_default_slot_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Javascript - React, Typescript");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(31:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (32:4) <ListItem>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Relational and noSQL databases");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(32:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (33:4) <ListItem>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hybrid mobile apps");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(33:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (34:4) <ListItem>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Golang");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(34:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (29:3) <List>
    function create_default_slot_7(ctx) {
    	let listitem0;
    	let t0;
    	let listitem1;
    	let t1;
    	let listitem2;
    	let t2;
    	let listitem3;
    	let t3;
    	let listitem4;
    	let current;

    	listitem0 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem1 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem2 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem3 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem4 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem0.$$.fragment);
    			t0 = space();
    			create_component(listitem1.$$.fragment);
    			t1 = space();
    			create_component(listitem2.$$.fragment);
    			t2 = space();
    			create_component(listitem3.$$.fragment);
    			t3 = space();
    			create_component(listitem4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(listitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(listitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(listitem3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(listitem4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem0_changes.$$scope = { dirty, ctx };
    			}

    			listitem0.$set(listitem0_changes);
    			const listitem1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem1_changes.$$scope = { dirty, ctx };
    			}

    			listitem1.$set(listitem1_changes);
    			const listitem2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem2_changes.$$scope = { dirty, ctx };
    			}

    			listitem2.$set(listitem2_changes);
    			const listitem3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem3_changes.$$scope = { dirty, ctx };
    			}

    			listitem3.$set(listitem3_changes);
    			const listitem4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem4_changes.$$scope = { dirty, ctx };
    			}

    			listitem4.$set(listitem4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem0.$$.fragment, local);
    			transition_in(listitem1.$$.fragment, local);
    			transition_in(listitem2.$$.fragment, local);
    			transition_in(listitem3.$$.fragment, local);
    			transition_in(listitem4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem0.$$.fragment, local);
    			transition_out(listitem1.$$.fragment, local);
    			transition_out(listitem2.$$.fragment, local);
    			transition_out(listitem3.$$.fragment, local);
    			transition_out(listitem4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(listitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(listitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(listitem3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(listitem4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(29:3) <List>",
    		ctx
    	});

    	return block;
    }

    // (28:2) <span slot="content">
    function create_content_slot_1(ctx) {
    	let span;
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(list.$$.fragment);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$e, 27, 2, 813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(list, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(list);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(28:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (26:1) <Section>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(26:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (40:2) <span slot="title">
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Contact";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$e, 39, 2, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(40:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (43:4) <ListItem>
    function create_default_slot_5(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "max@maxhurl.co.uk";
    			attr_dev(a, "href", "mailto:max@maxhurl.co.uk");
    			add_location(a, file$e, 43, 5, 1209);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(43:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (46:4) <ListItem>
    function create_default_slot_4(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "github.com/maximilianhurl";
    			attr_dev(a, "href", "https://github.com/maximilianhurl");
    			add_location(a, file$e, 46, 5, 1302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(46:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (49:4) <ListItem>
    function create_default_slot_3(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "linkedin.com/in/maxhurl";
    			attr_dev(a, "href", "https://www.linkedin.com/in/maxhurl/");
    			add_location(a, file$e, 49, 5, 1412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(49:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (42:3) <List>
    function create_default_slot_2(ctx) {
    	let listitem0;
    	let t0;
    	let listitem1;
    	let t1;
    	let listitem2;
    	let current;

    	listitem0 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem1 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem2 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem0.$$.fragment);
    			t0 = space();
    			create_component(listitem1.$$.fragment);
    			t1 = space();
    			create_component(listitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(listitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(listitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem0_changes.$$scope = { dirty, ctx };
    			}

    			listitem0.$set(listitem0_changes);
    			const listitem1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem1_changes.$$scope = { dirty, ctx };
    			}

    			listitem1.$set(listitem1_changes);
    			const listitem2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem2_changes.$$scope = { dirty, ctx };
    			}

    			listitem2.$set(listitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem0.$$.fragment, local);
    			transition_in(listitem1.$$.fragment, local);
    			transition_in(listitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem0.$$.fragment, local);
    			transition_out(listitem1.$$.fragment, local);
    			transition_out(listitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(listitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(listitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(42:3) <List>",
    		ctx
    	});

    	return block;
    }

    // (41:2) <span slot="content">
    function create_content_slot(ctx) {
    	let span;
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(list.$$.fragment);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$e, 40, 2, 1157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(list, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(list);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(41:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:1) <Section>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(39:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (10:0) <Layout>
    function create_default_slot(ctx) {
    	let title;
    	let t0;
    	let section0;
    	let t1;
    	let section1;
    	let t2;
    	let section2;
    	let current;
    	title = new Title({ $$inline: true });

    	section0 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_13],
    					content: [create_content_slot_2],
    					title: [create_title_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_6],
    					content: [create_content_slot_1],
    					title: [create_title_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1],
    					content: [create_content_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    			t0 = space();
    			create_component(section0.$$.fragment);
    			t1 = space();
    			create_component(section1.$$.fragment);
    			t2 = space();
    			create_component(section2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(10:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Layout, List, ListItem, Title, Section });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/routes/Missing.svelte generated by Svelte v3.31.0 */
    const file$f = "src/routes/Missing.svelte";

    // (13:4) <span slot="title">
    function create_title_slot$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "404";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$f, 12, 4, 196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$1.name,
    		type: "slot",
    		source: "(13:4) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (14:2) <span slot="content">
    function create_content_slot$1(ctx) {
    	let span;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("Uh oh.. looks like something has gone missing.");
    			br = element("br");
    			t1 = text("\n      Please check the URL and try again.");
    			add_location(br, file$f, 14, 52, 302);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$f, 13, 2, 228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, br);
    			append_dev(span, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot$1.name,
    		type: "slot",
    		source: "(14:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:1) <Section>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(12:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (10:0) <Layout>
    function create_default_slot$1(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$1],
    					content: [create_content_slot$1],
    					title: [create_title_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(10:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Missing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Missing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Layout, Section });
    	return [];
    }

    class Missing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Missing",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/content/HeaderWithDate.svelte generated by Svelte v3.31.0 */

    const file$g = "src/content/HeaderWithDate.svelte";
    const get_date_slot_changes = dirty => ({});
    const get_date_slot_context = ctx => ({});
    const get_title_slot_changes$1 = dirty => ({});
    const get_title_slot_context$1 = ctx => ({});

    function create_fragment$j(ctx) {
    	let div;
    	let h4;
    	let t;
    	let p;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[1].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context$1);
    	const date_slot_template = /*#slots*/ ctx[1].date;
    	const date_slot = create_slot(date_slot_template, ctx, /*$$scope*/ ctx[0], get_date_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			if (title_slot) title_slot.c();
    			t = space();
    			p = element("p");
    			if (date_slot) date_slot.c();
    			attr_dev(h4, "class", "svelte-1onll1e");
    			add_location(h4, file$g, 19, 2, 206);
    			attr_dev(p, "class", "svelte-1onll1e");
    			add_location(p, file$g, 22, 2, 252);
    			attr_dev(div, "class", "svelte-1onll1e");
    			add_location(div, file$g, 18, 0, 198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);

    			if (title_slot) {
    				title_slot.m(h4, null);
    			}

    			append_dev(div, t);
    			append_dev(div, p);

    			if (date_slot) {
    				date_slot.m(p, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_title_slot_changes$1, get_title_slot_context$1);
    				}
    			}

    			if (date_slot) {
    				if (date_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(date_slot, date_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_date_slot_changes, get_date_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(date_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(date_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    			if (date_slot) date_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HeaderWithDate", slots, ['title','date']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeaderWithDate> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class HeaderWithDate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeaderWithDate",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/routes/Cv.svelte generated by Svelte v3.31.0 */
    const file$h = "src/routes/Cv.svelte";

    // (23:2) <span slot="title">
    function create_title_slot_13(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "About";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 22, 2, 434);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_13.name,
    		type: "slot",
    		source: "(23:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:2) <span slot="content">
    function create_content_slot_8(ctx) {
    	let span;
    	let p;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			p.textContent = "I’m a full-stack web developer based in Brighton, with 10 years experience\n\t\t\t\ttaking projects from initial requirements through to finished product.\n\t\t\t\tI enjoy leading other developers and fostering collaboration across the\n\t\t\t\tteam. I’m a firm believer in agile development and always excited to\n\t\t\t\tlearn new technologies";
    			add_location(p, file$h, 24, 3, 493);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 23, 2, 468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_8.name,
    		type: "slot",
    		source: "(24:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:1) <Section>
    function create_default_slot_27(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_27.name,
    		type: "slot",
    		source: "(22:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (36:2) <span slot="title">
    function create_title_slot_12(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Contact";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 35, 2, 871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_12.name,
    		type: "slot",
    		source: "(36:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:4) <ListItem>
    function create_default_slot_26(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "max@maxhurl.co.uk";
    			attr_dev(a, "href", "mailto:max@maxhurl.co.uk");
    			attr_dev(a, "class", "svelte-ffgiyh");
    			add_location(a, file$h, 39, 5, 959);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_26.name,
    		type: "slot",
    		source: "(39:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (42:4) <ListItem>
    function create_default_slot_25(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "github.com/maximilianhurl";
    			attr_dev(a, "href", "https://github.com/maximilianhurl");
    			attr_dev(a, "class", "svelte-ffgiyh");
    			add_location(a, file$h, 42, 5, 1052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_25.name,
    		type: "slot",
    		source: "(42:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (45:4) <ListItem>
    function create_default_slot_24(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "linkedin.com/in/maxhurl";
    			attr_dev(a, "href", "https://www.linkedin.com/in/maxhurl/");
    			attr_dev(a, "class", "svelte-ffgiyh");
    			add_location(a, file$h, 45, 5, 1162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(45:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (38:3) <List>
    function create_default_slot_23(ctx) {
    	let listitem0;
    	let t0;
    	let listitem1;
    	let t1;
    	let listitem2;
    	let current;

    	listitem0 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_26] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem1 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_25] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem2 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_24] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem0.$$.fragment);
    			t0 = space();
    			create_component(listitem1.$$.fragment);
    			t1 = space();
    			create_component(listitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(listitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(listitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem0_changes.$$scope = { dirty, ctx };
    			}

    			listitem0.$set(listitem0_changes);
    			const listitem1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem1_changes.$$scope = { dirty, ctx };
    			}

    			listitem1.$set(listitem1_changes);
    			const listitem2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem2_changes.$$scope = { dirty, ctx };
    			}

    			listitem2.$set(listitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem0.$$.fragment, local);
    			transition_in(listitem1.$$.fragment, local);
    			transition_in(listitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem0.$$.fragment, local);
    			transition_out(listitem1.$$.fragment, local);
    			transition_out(listitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(listitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(listitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(38:3) <List>",
    		ctx
    	});

    	return block;
    }

    // (37:2) <span slot="content">
    function create_content_slot_7(ctx) {
    	let span;
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_23] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(list.$$.fragment);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 36, 2, 907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(list, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(list);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_7.name,
    		type: "slot",
    		source: "(37:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (35:1) <Section>
    function create_default_slot_22(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(35:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (53:2) <span slot="title">
    function create_title_slot_11(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Key technologies";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 52, 2, 1300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_11.name,
    		type: "slot",
    		source: "(53:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (56:4) <ListItem>
    function create_default_slot_21(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Python - Django");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(56:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (57:4) <ListItem>
    function create_default_slot_20(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Javascript - React & Typescript");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(57:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (58:4) <ListItem>
    function create_default_slot_19(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Golang");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(58:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (59:4) <ListItem>
    function create_default_slot_18(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Creating & integrating with APIs");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(59:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (60:4) <ListItem>
    function create_default_slot_17(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Unit and integration testing");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(60:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (61:4) <ListItem>
    function create_default_slot_16(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Relational and noSQL DBs");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(61:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (62:4) <ListItem>
    function create_default_slot_15(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Infrastructure automation tools");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(62:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (63:4) <ListItem>
    function create_default_slot_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hybrid mobile apps");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(63:4) <ListItem>",
    		ctx
    	});

    	return block;
    }

    // (55:3) <List>
    function create_default_slot_13$1(ctx) {
    	let listitem0;
    	let t0;
    	let listitem1;
    	let t1;
    	let listitem2;
    	let t2;
    	let listitem3;
    	let t3;
    	let listitem4;
    	let t4;
    	let listitem5;
    	let t5;
    	let listitem6;
    	let t6;
    	let listitem7;
    	let current;

    	listitem0 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_21] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem1 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_20] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem2 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_19] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem3 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_18] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem4 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem5 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem6 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	listitem7 = new ListItem({
    			props: {
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem0.$$.fragment);
    			t0 = space();
    			create_component(listitem1.$$.fragment);
    			t1 = space();
    			create_component(listitem2.$$.fragment);
    			t2 = space();
    			create_component(listitem3.$$.fragment);
    			t3 = space();
    			create_component(listitem4.$$.fragment);
    			t4 = space();
    			create_component(listitem5.$$.fragment);
    			t5 = space();
    			create_component(listitem6.$$.fragment);
    			t6 = space();
    			create_component(listitem7.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(listitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(listitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(listitem3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(listitem4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(listitem5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(listitem6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(listitem7, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem0_changes.$$scope = { dirty, ctx };
    			}

    			listitem0.$set(listitem0_changes);
    			const listitem1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem1_changes.$$scope = { dirty, ctx };
    			}

    			listitem1.$set(listitem1_changes);
    			const listitem2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem2_changes.$$scope = { dirty, ctx };
    			}

    			listitem2.$set(listitem2_changes);
    			const listitem3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem3_changes.$$scope = { dirty, ctx };
    			}

    			listitem3.$set(listitem3_changes);
    			const listitem4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem4_changes.$$scope = { dirty, ctx };
    			}

    			listitem4.$set(listitem4_changes);
    			const listitem5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem5_changes.$$scope = { dirty, ctx };
    			}

    			listitem5.$set(listitem5_changes);
    			const listitem6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem6_changes.$$scope = { dirty, ctx };
    			}

    			listitem6.$set(listitem6_changes);
    			const listitem7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				listitem7_changes.$$scope = { dirty, ctx };
    			}

    			listitem7.$set(listitem7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem0.$$.fragment, local);
    			transition_in(listitem1.$$.fragment, local);
    			transition_in(listitem2.$$.fragment, local);
    			transition_in(listitem3.$$.fragment, local);
    			transition_in(listitem4.$$.fragment, local);
    			transition_in(listitem5.$$.fragment, local);
    			transition_in(listitem6.$$.fragment, local);
    			transition_in(listitem7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem0.$$.fragment, local);
    			transition_out(listitem1.$$.fragment, local);
    			transition_out(listitem2.$$.fragment, local);
    			transition_out(listitem3.$$.fragment, local);
    			transition_out(listitem4.$$.fragment, local);
    			transition_out(listitem5.$$.fragment, local);
    			transition_out(listitem6.$$.fragment, local);
    			transition_out(listitem7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(listitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(listitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(listitem3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(listitem4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(listitem5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(listitem6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(listitem7, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13$1.name,
    		type: "slot",
    		source: "(55:3) <List>",
    		ctx
    	});

    	return block;
    }

    // (54:2) <span slot="content">
    function create_content_slot_6(ctx) {
    	let span;
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_13$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(list.$$.fragment);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 53, 2, 1345);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(list, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(list);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_6.name,
    		type: "slot",
    		source: "(54:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (52:1) <Section>
    function create_default_slot_12$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12$1.name,
    		type: "slot",
    		source: "(52:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (69:2) <span slot="title">
    function create_title_slot_10(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Experience";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 68, 2, 1817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_10.name,
    		type: "slot",
    		source: "(69:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:4) <span slot="title">
    function create_title_slot_9(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Futrli - Engineering Team Lead";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 71, 4, 1902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_9.name,
    		type: "slot",
    		source: "(72:4) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (73:4) <span slot="date">
    function create_date_slot_4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Dec 2018 - Present";
    			attr_dev(span, "slot", "date");
    			add_location(span, file$h, 72, 4, 1963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_date_slot_4.name,
    		type: "slot",
    		source: "(73:4) <span slot=\\\"date\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:3) <HeaderWithDate>
    function create_default_slot_11$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11$1.name,
    		type: "slot",
    		source: "(71:3) <HeaderWithDate>",
    		ctx
    	});

    	return block;
    }

    // (70:2) <span slot="content">
    function create_content_slot_5(ctx) {
    	let span;
    	let headerwithdate;
    	let t0;
    	let p;
    	let current;

    	headerwithdate = new HeaderWithDate({
    			props: {
    				$$slots: {
    					default: [create_default_slot_11$1],
    					date: [create_date_slot_4],
    					title: [create_title_slot_9]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(headerwithdate.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "I lead a multidisciplinary team in charge of Predict, a real time cash flow\n\t\t\t\tforecasting tool. As part of my role I help the product team with planning, conduct\n\t\t\t\tline management, facilitate discussions, set technical direction (with the help of the team)\n\t\t\t\tand contribute to the back and frontend of the project.";
    			add_location(p, file$h, 74, 3, 2031);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 69, 2, 1856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(headerwithdate, span, null);
    			append_dev(span, t0);
    			append_dev(span, p);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerwithdate_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				headerwithdate_changes.$$scope = { dirty, ctx };
    			}

    			headerwithdate.$set(headerwithdate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerwithdate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerwithdate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(headerwithdate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_5.name,
    		type: "slot",
    		source: "(70:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:1) <Section>
    function create_default_slot_10$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10$1.name,
    		type: "slot",
    		source: "(68:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (85:2) <span slot="title">
    function create_title_slot_8(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 84, 2, 2404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_8.name,
    		type: "slot",
    		source: "(85:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (88:4) <span slot="title">
    function create_title_slot_7(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Airfinity - Senior Product Engineer";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 87, 4, 2479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_7.name,
    		type: "slot",
    		source: "(88:4) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (89:4) <span slot="date">
    function create_date_slot_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "July 2012 - January 2018";
    			attr_dev(span, "slot", "date");
    			add_location(span, file$h, 88, 4, 2545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_date_slot_3.name,
    		type: "slot",
    		source: "(89:4) <span slot=\\\"date\\\">",
    		ctx
    	});

    	return block;
    }

    // (87:3) <HeaderWithDate>
    function create_default_slot_9$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$1.name,
    		type: "slot",
    		source: "(87:3) <HeaderWithDate>",
    		ctx
    	});

    	return block;
    }

    // (86:2) <span slot="content">
    function create_content_slot_4(ctx) {
    	let span;
    	let headerwithdate;
    	let t0;
    	let p;
    	let current;

    	headerwithdate = new HeaderWithDate({
    			props: {
    				$$slots: {
    					default: [create_default_slot_9$1],
    					date: [create_date_slot_3],
    					title: [create_title_slot_7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(headerwithdate.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "As a full-stack engineer I contributed to all levels of the tech stack.\n\t\t\t\tFrom the ETL layer through to the data warehouse, internal Django powered\n\t\t\t\tAPI layer and down to the Node frontend web application. I also championed\n\t\t\t\tand implemented a gradual move to a React driven SPA while helping upskill\n\t\t\t\tmy colleagues along the way.";
    			add_location(p, file$h, 90, 3, 2619);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 85, 2, 2433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(headerwithdate, span, null);
    			append_dev(span, t0);
    			append_dev(span, p);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerwithdate_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				headerwithdate_changes.$$scope = { dirty, ctx };
    			}

    			headerwithdate.$set(headerwithdate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerwithdate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerwithdate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(headerwithdate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_4.name,
    		type: "slot",
    		source: "(86:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (84:1) <Section>
    function create_default_slot_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(84:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (102:2) <span slot="title">
    function create_title_slot_6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 101, 2, 3012);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_6.name,
    		type: "slot",
    		source: "(102:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (105:4) <span slot="title">
    function create_title_slot_5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "DabApps - Engineer";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 104, 4, 3087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_5.name,
    		type: "slot",
    		source: "(105:4) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (106:4) <span slot="date">
    function create_date_slot_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "July 2012 - January 2018";
    			attr_dev(span, "slot", "date");
    			add_location(span, file$h, 105, 4, 3136);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_date_slot_2.name,
    		type: "slot",
    		source: "(106:4) <span slot=\\\"date\\\">",
    		ctx
    	});

    	return block;
    }

    // (104:3) <HeaderWithDate>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(104:3) <HeaderWithDate>",
    		ctx
    	});

    	return block;
    }

    // (103:2) <span slot="content">
    function create_content_slot_3(ctx) {
    	let span;
    	let headerwithdate;
    	let t0;
    	let p;
    	let current;

    	headerwithdate = new HeaderWithDate({
    			props: {
    				$$slots: {
    					default: [create_default_slot_7$1],
    					date: [create_date_slot_2],
    					title: [create_title_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(headerwithdate.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "During my time at DabApps I was involved with projects at every step of the development\n\t\t\t\tprocess; from initial discussions with clients through to architecture planning,\n\t\t\t\tdeployment and large scale refactoring multiple years later. I also mentored multiple\n\t\t\t\tjunior developers and carried out some line management duties.";
    			add_location(p, file$h, 107, 3, 3210);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 102, 2, 3041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(headerwithdate, span, null);
    			append_dev(span, t0);
    			append_dev(span, p);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerwithdate_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				headerwithdate_changes.$$scope = { dirty, ctx };
    			}

    			headerwithdate.$set(headerwithdate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerwithdate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerwithdate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(headerwithdate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_3.name,
    		type: "slot",
    		source: "(103:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (101:1) <Section>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(101:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (118:2) <span slot="title">
    function create_title_slot_4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 117, 2, 3592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_4.name,
    		type: "slot",
    		source: "(118:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (121:4) <span slot="title">
    function create_title_slot_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Freelance development";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 120, 4, 3667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_3.name,
    		type: "slot",
    		source: "(121:4) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (122:4) <span slot="date">
    function create_date_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "2009 - 2017";
    			attr_dev(span, "slot", "date");
    			add_location(span, file$h, 121, 4, 3719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_date_slot_1.name,
    		type: "slot",
    		source: "(122:4) <span slot=\\\"date\\\">",
    		ctx
    	});

    	return block;
    }

    // (120:3) <HeaderWithDate>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(120:3) <HeaderWithDate>",
    		ctx
    	});

    	return block;
    }

    // (119:2) <span slot="content">
    function create_content_slot_2$1(ctx) {
    	let span;
    	let headerwithdate;
    	let t0;
    	let p;
    	let current;

    	headerwithdate = new HeaderWithDate({
    			props: {
    				$$slots: {
    					default: [create_default_slot_5$1],
    					date: [create_date_slot_1],
    					title: [create_title_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(headerwithdate.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "Moonlighting on a range of projects mostly small scale CMS driven sites using Python and Wordpress.";
    			add_location(p, file$h, 123, 3, 3780);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 118, 2, 3621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(headerwithdate, span, null);
    			append_dev(span, t0);
    			append_dev(span, p);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerwithdate_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				headerwithdate_changes.$$scope = { dirty, ctx };
    			}

    			headerwithdate.$set(headerwithdate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerwithdate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerwithdate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(headerwithdate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_2$1.name,
    		type: "slot",
    		source: "(119:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (117:1) <Section>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(117:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (131:2) <span slot="title">
    function create_title_slot_2$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Education";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 130, 2, 3932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_2$1.name,
    		type: "slot",
    		source: "(131:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (134:4) <span slot="title">
    function create_title_slot_1$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Brighton University";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 133, 4, 4016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1$1.name,
    		type: "slot",
    		source: "(134:4) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (135:4) <span slot="date">
    function create_date_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Sept 2009 - June 2012";
    			attr_dev(span, "slot", "date");
    			add_location(span, file$h, 134, 4, 4066);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_date_slot.name,
    		type: "slot",
    		source: "(135:4) <span slot=\\\"date\\\">",
    		ctx
    	});

    	return block;
    }

    // (133:3) <HeaderWithDate>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(133:3) <HeaderWithDate>",
    		ctx
    	});

    	return block;
    }

    // (132:2) <span slot="content">
    function create_content_slot_1$1(ctx) {
    	let span;
    	let headerwithdate;
    	let t0;
    	let p;
    	let current;

    	headerwithdate = new HeaderWithDate({
    			props: {
    				$$slots: {
    					default: [create_default_slot_3$1],
    					date: [create_date_slot],
    					title: [create_title_slot_1$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(headerwithdate.$$.fragment);
    			t0 = space();
    			p = element("p");
    			p.textContent = "BSc Digital Media Development - 1st";
    			add_location(p, file$h, 136, 3, 4137);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 131, 2, 3970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(headerwithdate, span, null);
    			append_dev(span, t0);
    			append_dev(span, p);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const headerwithdate_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				headerwithdate_changes.$$scope = { dirty, ctx };
    			}

    			headerwithdate.$set(headerwithdate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerwithdate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerwithdate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(headerwithdate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1$1.name,
    		type: "slot",
    		source: "(132:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (130:1) <Section>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(130:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (142:2) <span slot="title">
    function create_title_slot$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Interests";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$h, 141, 2, 4216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$2.name,
    		type: "slot",
    		source: "(142:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (143:2) <span slot="content">
    function create_content_slot$2(ctx) {
    	let span;
    	let p;
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p = element("p");
    			t0 = text("I used to enjoy attending local programming meet-ups. Outside of my work,\n\t\t\t\tI’m a keen runner, an avid film fan and always enjoy a\n\t\t\t\tgood ");
    			a = element("a");
    			a.textContent = "cat GIF";
    			t2 = text(".");
    			attr_dev(a, "href", "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif");
    			attr_dev(a, "class", "svelte-ffgiyh");
    			add_location(a, file$h, 146, 9, 4429);
    			add_location(p, file$h, 143, 3, 4279);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$h, 142, 2, 4254);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(p, t2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot$2.name,
    		type: "slot",
    		source: "(143:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (141:1) <Section>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(141:1) <Section>",
    		ctx
    	});

    	return block;
    }

    // (19:0) <Layout>
    function create_default_slot$2(ctx) {
    	let title;
    	let t0;
    	let section0;
    	let t1;
    	let section1;
    	let t2;
    	let section2;
    	let t3;
    	let section3;
    	let t4;
    	let section4;
    	let t5;
    	let section5;
    	let t6;
    	let section6;
    	let t7;
    	let section7;
    	let t8;
    	let section8;
    	let current;
    	title = new Title({ $$inline: true });

    	section0 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_27],
    					content: [create_content_slot_8],
    					title: [create_title_slot_13]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_22],
    					content: [create_content_slot_7],
    					title: [create_title_slot_12]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_12$1],
    					content: [create_content_slot_6],
    					title: [create_title_slot_11]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section3 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_10$1],
    					content: [create_content_slot_5],
    					title: [create_title_slot_10]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section4 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_8$1],
    					content: [create_content_slot_4],
    					title: [create_title_slot_8]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section5 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_6$1],
    					content: [create_content_slot_3],
    					title: [create_title_slot_6]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section6 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_4$1],
    					content: [create_content_slot_2$1],
    					title: [create_title_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section7 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_2$1],
    					content: [create_content_slot_1$1],
    					title: [create_title_slot_2$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section8 = new Section({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$2],
    					content: [create_content_slot$2],
    					title: [create_title_slot$2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title.$$.fragment);
    			t0 = space();
    			create_component(section0.$$.fragment);
    			t1 = space();
    			create_component(section1.$$.fragment);
    			t2 = space();
    			create_component(section2.$$.fragment);
    			t3 = space();
    			create_component(section3.$$.fragment);
    			t4 = space();
    			create_component(section4.$$.fragment);
    			t5 = space();
    			create_component(section5.$$.fragment);
    			t6 = space();
    			create_component(section6.$$.fragment);
    			t7 = space();
    			create_component(section7.$$.fragment);
    			t8 = space();
    			create_component(section8.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(section3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(section4, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(section5, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(section6, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(section7, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(section8, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    			const section3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section3_changes.$$scope = { dirty, ctx };
    			}

    			section3.$set(section3_changes);
    			const section4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section4_changes.$$scope = { dirty, ctx };
    			}

    			section4.$set(section4_changes);
    			const section5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section5_changes.$$scope = { dirty, ctx };
    			}

    			section5.$set(section5_changes);
    			const section6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section6_changes.$$scope = { dirty, ctx };
    			}

    			section6.$set(section6_changes);
    			const section7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section7_changes.$$scope = { dirty, ctx };
    			}

    			section7.$set(section7_changes);
    			const section8_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section8_changes.$$scope = { dirty, ctx };
    			}

    			section8.$set(section8_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(section3.$$.fragment, local);
    			transition_in(section4.$$.fragment, local);
    			transition_in(section5.$$.fragment, local);
    			transition_in(section6.$$.fragment, local);
    			transition_in(section7.$$.fragment, local);
    			transition_in(section8.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(section3.$$.fragment, local);
    			transition_out(section4.$$.fragment, local);
    			transition_out(section5.$$.fragment, local);
    			transition_out(section6.$$.fragment, local);
    			transition_out(section7.$$.fragment, local);
    			transition_out(section8.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(section3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(section4, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(section5, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(section6, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(section7, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(section8, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(19:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cv", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cv> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Layout,
    		HeaderWithDate,
    		List,
    		ListItem,
    		Title,
    		Section
    	});

    	return [];
    }

    class Cv extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cv",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    // (13:1) <Route path="/">
    function create_default_slot_1$3(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(13:1) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (10:0) <Router url="{url}">
    function create_default_slot$3(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let current;

    	route0 = new Route({
    			props: { path: "cv", component: Cv },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "CV", component: Cv },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: { path: "", component: Missing },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(10:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ Router, Route, Home, Missing, Cv, url });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
