## API Report File for "fluid-framework"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AttachState } from '@fluidframework/container-definitions';
import { ConnectionState } from '@fluidframework/container-loader';
import { ContainerErrorType } from '@fluidframework/container-definitions';
import { ContainerSchema } from '@fluidframework/fluid-static';
import { DataObjectClass } from '@fluidframework/fluid-static';
import { DeserializeCallback } from '@fluidframework/sequence';
import { DirectoryFactory } from '@fluidframework/map';
import { DOProviderContainerRuntimeFactory } from '@fluidframework/fluid-static';
import { DriverErrorType } from '@fluidframework/driver-definitions';
import { FluidContainer } from '@fluidframework/fluid-static';
import { getTextAndMarkers } from '@fluidframework/sequence';
import { IConnection } from '@fluidframework/fluid-static';
import { ICriticalContainerError } from '@fluidframework/container-definitions';
import { IDirectory } from '@fluidframework/map';
import { IDirectoryClearOperation } from '@fluidframework/map';
import { IDirectoryCreateSubDirectoryOperation } from '@fluidframework/map';
import { IDirectoryDataObject } from '@fluidframework/map';
import { IDirectoryDeleteOperation } from '@fluidframework/map';
import { IDirectoryDeleteSubDirectoryOperation } from '@fluidframework/map';
import { IDirectoryEvents } from '@fluidframework/map';
import { IDirectoryKeyOperation } from '@fluidframework/map';
import { IDirectoryNewStorageFormat } from '@fluidframework/map';
import { IDirectoryOperation } from '@fluidframework/map';
import { IDirectorySetOperation } from '@fluidframework/map';
import { IDirectoryStorageOperation } from '@fluidframework/map';
import { IDirectorySubDirectoryOperation } from '@fluidframework/map';
import { IDirectoryValueChanged } from '@fluidframework/map';
import { IFluidContainer } from '@fluidframework/fluid-static';
import { IFluidContainerEvents } from '@fluidframework/fluid-static';
import { IInterval } from '@fluidframework/sequence';
import { IIntervalCollection } from '@fluidframework/sequence';
import { IIntervalCollectionEvent } from '@fluidframework/sequence';
import { IIntervalHelpers } from '@fluidframework/sequence';
import { IJSONRunSegment } from '@fluidframework/sequence';
import { ILocalValue } from '@fluidframework/map';
import { IMapMessageLocalMetadata } from '@fluidframework/sequence';
import { IMember } from '@fluidframework/fluid-static';
import { Interval } from '@fluidframework/sequence';
import { IntervalLocator } from '@fluidframework/sequence';
import { intervalLocatorFromEndpoint } from '@fluidframework/sequence';
import { IntervalType } from '@fluidframework/sequence';
import { IRootDataObject } from '@fluidframework/fluid-static';
import { ISequenceDeltaRange } from '@fluidframework/sequence';
import { ISerializableInterval } from '@fluidframework/sequence';
import { ISerializableValue } from '@fluidframework/map';
import { ISerializedInterval } from '@fluidframework/sequence';
import { ISerializedValue } from '@fluidframework/map';
import { IServiceAudience } from '@fluidframework/fluid-static';
import { IServiceAudienceEvents } from '@fluidframework/fluid-static';
import { ISharedDirectory } from '@fluidframework/map';
import { ISharedDirectoryEvents } from '@fluidframework/map';
import { ISharedIntervalCollection } from '@fluidframework/sequence';
import { ISharedMap } from '@fluidframework/map';
import { ISharedMapEvents } from '@fluidframework/map';
import { ISharedSegmentSequenceEvents } from '@fluidframework/sequence';
import { ISharedString } from '@fluidframework/sequence';
import { IValueChanged } from '@fluidframework/map';
import { IValueOpEmitter } from '@fluidframework/sequence';
import { LoadableObjectClass } from '@fluidframework/fluid-static';
import { LoadableObjectClassRecord } from '@fluidframework/fluid-static';
import { LoadableObjectCtor } from '@fluidframework/fluid-static';
import { LoadableObjectRecord } from '@fluidframework/fluid-static';
import { LocalValueMaker } from '@fluidframework/map';
import { MapFactory } from '@fluidframework/map';
import { MemberChangedListener } from '@fluidframework/fluid-static';
import { SequenceDeltaEvent } from '@fluidframework/sequence';
import { SequenceEvent } from '@fluidframework/sequence';
import { SequenceInterval } from '@fluidframework/sequence';
import { SequenceMaintenanceEvent } from '@fluidframework/sequence';
import { SerializedIntervalDelta } from '@fluidframework/sequence';
import { ServiceAudience } from '@fluidframework/fluid-static';
import { SharedDirectory } from '@fluidframework/map';
import { SharedIntervalCollection } from '@fluidframework/sequence';
import { SharedIntervalCollectionFactory } from '@fluidframework/sequence';
import { SharedMap } from '@fluidframework/map';
import { SharedObjectClass } from '@fluidframework/fluid-static';
import { SharedSegmentSequence } from '@fluidframework/sequence';
import { SharedSequence } from '@fluidframework/sequence';
import { SharedString } from '@fluidframework/sequence';
import { SharedStringFactory } from '@fluidframework/sequence';
import { SharedStringSegment } from '@fluidframework/sequence';
import { SubSequence } from '@fluidframework/sequence';

export { AttachState }

export { ConnectionState }

export { ContainerErrorType }

export { ContainerSchema }

export { DataObjectClass }

export { DeserializeCallback }

export { DirectoryFactory }

export { DOProviderContainerRuntimeFactory }

export { DriverErrorType }

export { FluidContainer }

export { getTextAndMarkers }

export { IConnection }

export { ICriticalContainerError }

export { IDirectory }

export { IDirectoryClearOperation }

export { IDirectoryCreateSubDirectoryOperation }

export { IDirectoryDataObject }

export { IDirectoryDeleteOperation }

export { IDirectoryDeleteSubDirectoryOperation }

export { IDirectoryEvents }

export { IDirectoryKeyOperation }

export { IDirectoryNewStorageFormat }

export { IDirectoryOperation }

export { IDirectorySetOperation }

export { IDirectoryStorageOperation }

export { IDirectorySubDirectoryOperation }

export { IDirectoryValueChanged }

export { IFluidContainer }

export { IFluidContainerEvents }

export { IInterval }

export { IIntervalCollection }

export { IIntervalCollectionEvent }

export { IIntervalHelpers }

export { IJSONRunSegment }

export { ILocalValue }

export { IMapMessageLocalMetadata }

export { IMember }

export { Interval }

export { IntervalLocator }

export { intervalLocatorFromEndpoint }

export { IntervalType }

export { IRootDataObject }

export { ISequenceDeltaRange }

export { ISerializableInterval }

export { ISerializableValue }

export { ISerializedInterval }

export { ISerializedValue }

export { IServiceAudience }

export { IServiceAudienceEvents }

export { ISharedDirectory }

export { ISharedDirectoryEvents }

export { ISharedIntervalCollection }

export { ISharedMap }

export { ISharedMapEvents }

export { ISharedSegmentSequenceEvents }

export { ISharedString }

export { IValueChanged }

export { IValueOpEmitter }

export { LoadableObjectClass }

export { LoadableObjectClassRecord }

export { LoadableObjectCtor }

export { LoadableObjectRecord }

export { LocalValueMaker }

export { MapFactory }

export { MemberChangedListener }

export { SequenceDeltaEvent }

export { SequenceEvent }

export { SequenceInterval }

export { SequenceMaintenanceEvent }

export { SerializedIntervalDelta }

export { ServiceAudience }

export { SharedDirectory }

export { SharedIntervalCollection }

export { SharedIntervalCollectionFactory }

export { SharedMap }

export { SharedObjectClass }

export { SharedSegmentSequence }

export { SharedSequence }

export { SharedString }

export { SharedStringFactory }

export { SharedStringSegment }

export { SubSequence }

```