import { useEffect, useState } from 'preact/hooks';
import { createUseMachine } from 'robot-hooks';

export const useMachine = createUseMachine(useEffect, useState);