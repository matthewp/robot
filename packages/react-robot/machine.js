import { useEffect, useState } from 'react';
import { createUseMachine } from 'robot-hooks';

export const useMachine = createUseMachine(useEffect, useState);