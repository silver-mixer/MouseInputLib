export default class MouseButtonInput{
	MOUSE_LEFT_BUTTON = 0;
	MOUSE_MIDDLE_BUTTON = 1;
	MOUSE_RIGHT_BUTTON = 2;
	MOUSE_BUTTON_1 = this.MOUSE_LEFT_BUTTON;
	MOUSE_BUTTON_2 = this.MOUSE_MIDDLE_BUTTON;
	MOUSE_BUTTON_3 = this.MOUSE_RIGHT_BUTTON;
	MOUSE_BUTTON_4 = 3;
	MOUSE_BUTTON_5 = 4;
	
	#targetElement;
	#buttonStateMap;
	#pressedTimeMap;
	#hasPreventEvent;

	/**
	 * 要素のキーイベントを監視します。
	 * @param {HTMLElement} targetElement 対象の要素
	 */
	constructor(targetElement){
		this.#targetElement = targetElement;
		this.#buttonStateMap = new Map();
		this.#pressedTimeMap = new Map();
		this.#hasPreventEvent = false;

		targetElement.addEventListener('mousedown', event => {
			if(this.#hasPreventEvent){
				event.preventDefault();
			}
			let state;
			if(this.#buttonStateMap.has(event.button)){
				state = this.#buttonStateMap.get(event.button);
				state.pressing = true;
			}else{
				state = {
					prevPressed: false,
					pressing: true,
					pressEdge: false,
					releaseEdge: false
				};
			}
			this.#buttonStateMap.set(event.button, state);
		});
		targetElement.addEventListener('mouseup', event => {
			if(this.#hasPreventEvent){
				event.preventDefault();
			}
			let state;
			if(this.#buttonStateMap.has(event.button)){
				state = this.#buttonStateMap.get(event.button);
				state.pressing = false;
			}else{
				state = {
					prevPressed: true,
					pressing: false,
					pressEdge: false,
					releaseEdge: false
				};
			}
			this.#buttonStateMap.set(event.button, state);
		});
	}

	/**
	 * 規定のマウスボタン処理をブロックするか
	 * @param {boolean} hasPreventEvent マウスボタン処理をブロックするか
	 */
	setPreventEvent(hasPreventEvent){
		this.#hasPreventEvent = hasPreventEvent;
	}

	/**
	 * 押されているボタンの時間にdeltaを加算します。
	 * `delta`を省略した場合は`1`となり、これはフレーム数に依存した処理を書く場合に適しています。
	 * @param {number} delta 前回のupdate()から経過した時間(デフォルト: `1`)
	 */
	update(delta = 1){
		for(let key of this.#buttonStateMap.keys()){
			const state = this.#buttonStateMap.get(key);
			state.releaseEdge = false;
			state.pressEdge = false;
			if(state.pressing){
				if(!state.prevPressed){
					state.pressEdge = true;
				}
				if(this.#pressedTimeMap.has(key)){
					this.#pressedTimeMap.set(key, this.#pressedTimeMap.get(key) + delta);
				}else{
					this.#pressedTimeMap.set(key, delta);
				}
				state.prevPressed = true;
			}else{
				if(state.prevPressed){
					state.releaseEdge = true;
				}
				this.#pressedTimeMap.set(key, 0);
				state.prevPressed = false;
			}
		}
	}

	/**
	 * 指定したボタンが押されている時間を返します。
	 * @param {number} button 押されている時間を調べたいボタン
	 * @return {number} ボタンが押されている時間
	 */
	getPressedTime(button){
		return (this.#pressedTimeMap.has(button) ? this.#pressedTimeMap.get(button) : 0);
	}

	/**
	 * 指定したボタンが押されているかを返します。
	 * @param {number} button 押されているか調べたいボタン
	 * @return {boolean} ボタンが押されているか
	 */
	isPressed(button){
		return (this.#buttonStateMap.has(button) && this.#buttonStateMap.get(button).pressing);
	}

	/**
	 * 指定したボタンが押された瞬間かを返します。
	 * @param {number} button 押された瞬間か調べたいボタン
	 * @return {boolean} ボタンが押された瞬間か
	 */
	isPressEdge(button){
		return (this.#buttonStateMap.has(button) && this.#buttonStateMap.get(button).pressEdge);
	}

	/**
	 * 指定したボタンが離された瞬間かを返します。
	 * @param {number} button 離された瞬間か調べたいボタン
	 * @return {boolean} ボタンが離された瞬間か
	 */
	isReleaseEdge(button){
		return (this.#buttonStateMap.has(button) && this.#buttonStateMap.get(button).releaseEdge);
	}

	/**
	 * 監視対象の要素を返します。
	 * @return {HTMLElement} 監視対象の要素
	 */
	getTargetElement(){
		return this.#targetElement;
	}
}
