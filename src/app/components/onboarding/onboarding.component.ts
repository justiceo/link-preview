import { Component, OnInit } from '@angular/core';
import { applyConfig, DefaultConfig } from '../audio-waves/audio-wave';

@Component({
  selector: 'audate-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  steps = ['hello', 'world'];

  headerWave = DefaultConfig;
  footerWave = DefaultConfig;

  constructor() {
    this.headerWave = applyConfig({
      width: 0,
      height: 200,
      opaqueColor: '#410ff8',
    });

    this.footerWave = applyConfig({
      width: 0,
      height: 20,
      opaqueColor: '#410ff8',
      rotation: 180,
      nodeCount: 180,
    });
  }

  ngOnInit(): void {}
}
