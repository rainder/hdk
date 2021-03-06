import { PrivateKeyDerivation } from '../js/crypto.js';

export const mount = (app) => app.component('container', {
  template: `
    <div class="container">
      <h2 class="mt-3">Hierarchical Deterministic Key Generator</h2>
      
      
      <div class="row">
        
          <div class="col-sm-6">
            <div v-for="index of numBranches" class="mb-3">
              <label for="shares">Branch #{{ index }}</label>
              <div class="input-group">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ branchTypes[index - 1] }}
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click="branchTypes[index - 1] = 'text'">text</a></li>
                  <li><a class="dropdown-item" href="#" @click="branchTypes[index - 1] = 'hex'">hex</a></li>
                  <li><a class="dropdown-item" href="#" @click="branchTypes[index - 1] = 'number'">number</a></li>
                </ul>
                <input :type="showField === index ? 'text' : 'password'" class="form-control font-awesome" v-model="branches[index - 1]" :tabindex="index"/>
                <button class="btn btn-outline-secondary" type="button" @click="showField = showField === index ? -1 : index" @mouseleave="showField = -1">
                  <template v-if="showField === index">◎</template>
                  <template v-else>◉</template>
                </button>
              </div>
            </div>
          </div>
          <div class="col-sm-6 mb-3">
            <div class="row">
              <div class="col-6 mb-3">
                <label>Private key</label>
                <textarea class="form-control font-awesome" readonly @focus="outputFocus ^= 1" @blur="outputFocus ^= 1">{{ mask(uint8ArrayToHex(pkd.privateKey), outputFocus & 1) }}</textarea>
              </div>
              <div class="col-6 mb-3">
                <label>Chain Code</label>
                <textarea class="form-control font-awesome" readonly @focus="outputFocus ^= 2" @blur="outputFocus ^= 2">{{ mask(uint8ArrayToHex(pkd.chainCode), outputFocus & 2) }}</textarea>
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <textarea rows="1" class="form-control font-awesome" readonly @focus="outputFocus ^= 4" @blur="outputFocus ^= 4">{{ mask(pkd.toString(), outputFocus & 4) }}</textarea>
              </div>
            </div>
            
            <a href="#" @click.prevent="outputFocus ^= 7">Toggle output visibility</a>
          </div>
       
      </div>
    </div>  
  `,
  data: () => ({
    branchTypes: [],
    branches: [],
    showField: -1,
    pkd: new PrivateKeyDerivation(),
    outputFocus: 0,
  }),
  computed: {
    numBranches() {
      return this.branches.length + 1;
    },
  },
  methods: {
    mask(input, unmask) {
      return unmask ? input : input.replace(/./g, '*');
    },
    async calculateKeys() {
      this.pkd = new PrivateKeyDerivation();

      for (const [index, branch] of Object.entries(this.branches)) {
        const type = this.branchTypes[index];
        const value = type === 'text' ? branch : (type === 'number' ? Number(branch) : 0);

        this.pkd = await this.pkd.derive(value);
      }
    },
    uint8ArrayToHex: (arr) => {
      return Array.from(arr).map((code) => code.toString(16).padStart(2, '0')).join('').toUpperCase();
    },
  },
  watch: {
    branchTypes: {
      deep: true,
      handler() {
        this.calculateKeys();
      },
    },
    branches: {
      deep: true,
      immediate: true,
      handler() {
        for (let i = this.branches.length -1; i >= 0; i--) {
          if (this.branches[i]) {
            break;
          }

          this.branches.splice(i, 1);
        }

        for (let i = 0; i <= this.branches.length; i++) {
          if (this.branchTypes[i] === undefined) {
            this.branchTypes[i] = 'text';
          }
        }

        this.calculateKeys();
      }
    }
  },
  mounted() {

  },
})
