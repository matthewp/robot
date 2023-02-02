import { useMemo, useState } from 'haunted';
import { createUseMachine } from 'robot-hooks';

export const useMachine = createUseMachine(useMemo, useState);